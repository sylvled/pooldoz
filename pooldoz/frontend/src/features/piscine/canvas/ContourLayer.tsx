import type { Point } from './useCanvasPolygon'

interface ContourLayerProps {
  points: Point[]
  closed: boolean
  draggingIndex: number | null
  width: number
  height: number
  onVertexPointerDown: (index: number, e: React.PointerEvent) => void
}

const VERTEX_R = 10
const CLOSE_VISUAL_R = 16

export function ContourLayer({
  points,
  closed,
  draggingIndex,
  width,
  height,
  onVertexPointerDown,
}: ContourLayerProps) {
  if (points.length === 0) return null

  const toPixel = (p: Point) => ({ px: p.x * width, py: p.y * height })

  const pathData = points
    .map((p, i) => {
      const { px, py } = toPixel(p)
      return `${i === 0 ? 'M' : 'L'}${px},${py}`
    })
    .join(' ') + (closed ? ' Z' : '')

  return (
    <g>
      {/* Polygon fill */}
      {closed && (
        <path
          d={pathData}
          fill="var(--aqua)"
          fillOpacity={0.15}
          stroke="none"
        />
      )}

      {/* Polygon stroke */}
      <path
        d={pathData}
        fill="none"
        stroke="var(--aqua)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={closed ? undefined : '6 4'}
      />

      {/* Vertices */}
      {points.map((p, i) => {
        const { px, py } = toPixel(p)
        const isFirst = i === 0
        const isDragging = draggingIndex === i
        return (
          <g key={i}>
            {/* Close indicator ring on first vertex */}
            {isFirst && !closed && points.length >= 3 && (
              <circle
                cx={px}
                cy={py}
                r={CLOSE_VISUAL_R}
                fill="none"
                stroke="var(--aqua)"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.5}
              />
            )}
            <circle
              cx={px}
              cy={py}
              r={VERTEX_R}
              fill={isDragging ? 'var(--aqua)' : '#fff'}
              stroke="var(--aqua)"
              strokeWidth={isDragging ? 0 : 2}
              style={{ cursor: 'grab', touchAction: 'none' }}
              onPointerDown={(e) => {
                e.stopPropagation()
                onVertexPointerDown(i, e)
              }}
            />
          </g>
        )
      })}
    </g>
  )
}
