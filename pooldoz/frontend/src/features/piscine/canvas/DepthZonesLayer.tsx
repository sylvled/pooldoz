import type { Point } from './useCanvasPolygon'
import type { DepthZone } from './useDepthZones'

interface DepthZonesLayerProps {
  polygonPoints: Point[]
  zones: DepthZone[]
  width: number
  height: number
  onSepPointerDown: (index: number, e: React.PointerEvent) => void
}

// Map depth in metres to a CSS token
function depthColor(depth: number): string {
  if (depth < 1.0) return 'var(--depth-shallow)'
  if (depth < 1.5) return 'var(--depth-mid)'
  if (depth < 1.8) return 'var(--depth-slope)'
  return 'var(--depth-deep)'
}

function getBoundingBox(points: Point[]) {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  }
}

export function DepthZonesLayer({
  polygonPoints,
  zones,
  width,
  height,
  onSepPointerDown,
}: DepthZonesLayerProps) {
  if (polygonPoints.length < 3) return null

  const bb = getBoundingBox(polygonPoints)
  const bbW = bb.maxX - bb.minX
  const bbH = bb.maxY - bb.minY
  // Use horizontal axis for zone separators
  const useHorizontal = bbW >= bbH

  // Clip path from polygon
  const clipId = 'depth-clip'
  const pathData = polygonPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x * width},${p.y * height}`)
    .join(' ') + ' Z'

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={pathData} />
        </clipPath>
      </defs>

      {/* Zone fills */}
      {zones.map((zone, i) => {
        const prevSep = i === 0 ? 0 : zones[i - 1].separator
        const thisSep = zone.separator
        const avgDepth = zone.depthB != null ? (zone.depthA + zone.depthB) / 2 : zone.depthA

        let x1: number, y1: number, x2: number, y2: number
        if (useHorizontal) {
          x1 = (bb.minX + prevSep * bbW) * width
          y1 = bb.minY * height
          x2 = (bb.minX + thisSep * bbW) * width
          y2 = bb.maxY * height
        } else {
          x1 = bb.minX * width
          y1 = (bb.minY + prevSep * bbH) * height
          x2 = bb.maxX * width
          y2 = (bb.minY + thisSep * bbH) * height
        }

        return (
          <rect
            key={zone.id}
            x={x1}
            y={y1}
            width={x2 - x1}
            height={y2 - y1}
            fill={depthColor(avgDepth)}
            fillOpacity={0.6}
            clipPath={`url(#${clipId})`}
          />
        )
      })}

      {/* Separators (excluding last) */}
      {zones.slice(0, -1).map((zone, i) => {
        let x1: number, y1: number, x2: number, y2: number
        if (useHorizontal) {
          const sx = (bb.minX + zone.separator * bbW) * width
          x1 = sx; y1 = bb.minY * height
          x2 = sx; y2 = bb.maxY * height
        } else {
          const sy = (bb.minY + zone.separator * bbH) * height
          x1 = bb.minX * width; y1 = sy
          x2 = bb.maxX * width; y2 = sy
        }

        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2

        return (
          <g key={zone.id}>
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--calibration)"
              strokeWidth={3}
              strokeDasharray="8 4"
            />
            {/* Drag handle */}
            <circle
              cx={mx}
              cy={my}
              r={12}
              fill="#fff"
              stroke="var(--aqua)"
              strokeWidth={2}
              style={{ cursor: 'ns-resize', touchAction: 'none' }}
              onPointerDown={(e) => {
                e.stopPropagation()
                onSepPointerDown(i, e)
              }}
            />
            <text x={mx} y={my + 4} textAnchor="middle" fill="var(--aqua)" fontSize={10} fontWeight={700} style={{ pointerEvents: 'none' }}>
              ↕
            </text>
          </g>
        )
      })}
    </g>
  )
}
