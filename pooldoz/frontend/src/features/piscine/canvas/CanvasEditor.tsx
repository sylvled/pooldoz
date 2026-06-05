/**
 * CanvasEditor — multi-step pool configuration canvas.
 *
 * Steps: contour → profondeurs → calibrage
 * (La step "forme" est gérée dans OnboardingScreen avant le lancement du canvas)
 *
 * - ContourLayer: polygon drawing + vertex drag
 * - DepthZonesLayer: depth zone fills + separator drag
 * - CalibrationLine: two endpoints + distance input
 * - Volume calculation → ClimaxScreen
 *
 * CSS variables only.
 */
import { useRef, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '@/store/settings.store'
import { usePiscineStore } from '@/features/piscine/piscine.store'
import { StepPills } from '@/components/StepPills'
import { ContourLayer } from './ContourLayer'
import { DepthZonesLayer } from './DepthZonesLayer'
import { useCanvasPolygon } from './useCanvasPolygon'
import { useDepthZones } from './useDepthZones'
import { useCalibrationLine } from './useCalibrationLine'
import { useMagnifier } from './useMagnifier'
import { usePointerEvents } from './usePointerEvents'
import { detectContours } from '@/lib/cv'
import { calculateVolume } from '@/lib/chemistry'

export type CanvasStep = 'contour' | 'forme' | 'profondeurs' | 'calibrage'

interface CanvasEditorProps {
  backgroundImage?: string
}

const STEP_LABELS: CanvasStep[] = ['contour', 'forme', 'profondeurs', 'calibrage']
const STEP_DISPLAY = ['Contour', 'Forme', 'Profondeurs', 'Calibrage']

export function CanvasEditor({ backgroundImage }: CanvasEditorProps) {
  const navigate = useNavigate()
  const isBrutale = useSettingsStore((s) => s.theme) === 'brutale'
  const { activePiscineId, updatePiscine } = usePiscineStore()

  const svgRef = useRef<SVGSVGElement>(null)
  const [step, setStep] = useState<CanvasStep>('contour')
  const [snapAngles, setSnapAngles] = useState(false)
  const [svgSize, setSvgSize] = useState({ w: 1, h: 1 })
  const [detecting, setDetecting] = useState(() => !!backgroundImage)
  const [detectError, setDetectError] = useState<string | null>(null)
  const [calibDistInput, setCalibDistInput] = useState('')
  const [draggingCalib, setDraggingCalib] = useState<'p1' | 'p2' | null>(null)

  // Hooks
  const polygon   = useCanvasPolygon(snapAngles)
  const depthZones = useDepthZones()
  const calibration = useCalibrationLine()
  const { magnifier, startPress: startMagnifier, updatePosition: moveMagnifier, endPress: endMagnifier } = useMagnifier()

  // Read SVG size
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      setSvgSize({ w: rect.width || window.innerWidth, h: rect.height || window.innerHeight })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Auto-detect contours when background image provided
  useEffect(() => {
    if (!backgroundImage) return
    const margin = 0.1
    const fallback = [
      { x: margin, y: margin }, { x: 1 - margin, y: margin },
      { x: 1 - margin, y: 1 - margin }, { x: margin, y: 1 - margin },
    ]
    fetch(backgroundImage)
      .then((r) => r.blob())
      .then((blob) => detectContours(blob))
      .then((result) => {
        result.polygon.forEach((pt) => polygon.addPoint(pt))
        if (result.polygon.length >= 3) polygon.closePolygon()
        setDetecting(false)
      })
      .catch(() => {
        setDetectError('Détection impossible — placez les 4 coins manuellement')
        fallback.forEach((pt) => polygon.addPoint(pt))
        polygon.closePolygon()
        setDetecting(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundImage])

  // ── Vertex drag state ─────────────────────────────────────────────────────
  const [draggingVertexIndex, setDraggingVertexIndex] = useState<number | null>(null)

  const onPointerDown = useCallback(
    (pt: { x: number; y: number }) => {
      if (step !== 'contour' || polygon.closed) return
      polygon.addPoint(pt)
    },
    [step, polygon],
  )

  const onPointerMove = useCallback(
    (pt: { x: number; y: number }) => {
      // Vertex drag
      if (draggingVertexIndex !== null) {
        polygon.updateDrag(pt)
        moveMagnifier(pt.x, pt.y)
      }
      // Calibration endpoint drag
      if (draggingCalib) {
        calibration.updateDrag(pt)
      }
    },
    [draggingVertexIndex, draggingCalib, polygon, moveMagnifier, calibration],
  )

  const onPointerUp = useCallback(() => {
    if (draggingVertexIndex !== null) {
      polygon.endDrag()
      setDraggingVertexIndex(null)
      endMagnifier()
    }
    if (draggingCalib) {
      calibration.endDrag()
      setDraggingCalib(null)
    }
    depthZones.endDragSep()
  }, [draggingVertexIndex, draggingCalib, polygon, endMagnifier, calibration, depthZones])

  const { handlePointerDown, handlePointerMove, handlePointerUp } = usePointerEvents({
    svgRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  })

  function handleVertexPointerDown(index: number, e: React.PointerEvent) {
    setDraggingVertexIndex(index)
    polygon.startDrag(index)
    const pt = polygon.points[index]
    startMagnifier(pt.x, pt.y)
    e.stopPropagation()
  }

  // ── Separator drag for depth zones ────────────────────────────────────────
  function handleSepPointerDown(index: number, e: React.PointerEvent) {
    depthZones.startDragSep(index)
    e.stopPropagation()
    // Capture pointer on SVG so move events reach us
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  // We need to intercept pointer move for separator drag at the SVG level
  const handleSvgPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (depthZones.draggingSepIndex !== null && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        const { polygonPoints, bb, useHorizontal } = getZoneGeometry(polygon.points, svgSize.w, svgSize.h)
        if (polygonPoints.length < 3) return
        let frac: number
        if (useHorizontal) {
          const x = (e.clientX - rect.left) / rect.width
          frac = (x - bb.minX) / (bb.maxX - bb.minX)
        } else {
          const y = (e.clientY - rect.top) / rect.height
          frac = (y - bb.minY) / (bb.maxY - bb.minY)
        }
        depthZones.updateSepPosition(Math.max(0.05, Math.min(0.95, frac)))
      } else {
        handlePointerMove(e)
      }
    },
    [depthZones, polygon.points, svgSize, handlePointerMove],
  )

  // ── Volume calculation ────────────────────────────────────────────────────
  async function handleCalculateVolume() {
    const distVal = parseFloat(calibDistInput)
    if (isNaN(distVal) || distVal <= 0) return
    calibration.setRealLength(distVal)

    // Pixel length of calibration line in normalized space [0..1]
    const dx = calibration.line.p2.x - calibration.line.p1.x
    const dy = calibration.line.p2.y - calibration.line.p1.y
    const pixelLength = Math.sqrt(dx * dx + dy * dy)

    const volume = calculateVolume({
      plan: polygon.points,
      zones: depthZones.zones,
      coteCalibrage: { pixelLength, realLength: distVal },
    })

    if (activePiscineId) {
      await updatePiscine(activePiscineId, {
        plan: polygon.points,
        volume,
        coteCalibrage: { pixelLength, realLength: distVal },
      })
    }

    navigate('/climax', { state: { volume, zones: depthZones.zones } })
  }

  // ── Step config ───────────────────────────────────────────────────────────
  const stepIndex = STEP_LABELS.indexOf(step)
  const stepConfig = STEP_LABELS.map((_s, i) => ({
    label: STEP_DISPLAY[i],
    status: (i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'todo') as 'done' | 'active' | 'todo',
  }))

  // Calibration line pixel coords
  const cx1 = calibration.line.p1.x * svgSize.w
  const cy1 = calibration.line.p1.y * svgSize.h
  const cx2 = calibration.line.p2.x * svgSize.w
  const cy2 = calibration.line.p2.y * svgSize.h

  const accent = isBrutale ? '#D4FF00' : 'var(--aqua)'
  const btnCta: React.CSSProperties = {
    flex: 1, minHeight: 52,
    background: isBrutale ? 'var(--accent)' : 'linear-gradient(135deg, var(--aqua, #3DB8B8) 0%, var(--aqua-deep, #2A9090) 100%)',
    color: isBrutale ? 'var(--ink, #0A0A0A)' : '#fff',
    borderRadius: isBrutale ? 0 : 'var(--radius-xl)',
    border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer',
    boxShadow: isBrutale ? '4px 4px 0 var(--ink, #0A0A0A)' : 'var(--shadow-cta)',
    fontFamily: 'var(--font-ui)',
    textTransform: isBrutale ? 'uppercase' : 'none',
  }
  const btnSecondary: React.CSSProperties = {
    minHeight: 44, padding: '0 16px',
    border: `1.5px solid var(--border-color)`,
    borderRadius: isBrutale ? 0 : 'var(--radius-lg)',
    background: 'none', color: 'var(--text)',
    fontWeight: 600, fontSize: 14, cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--surface, #EDE3F8)', display: 'flex', flexDirection: 'column', zIndex: 50 }}>

      {/* Header */}
      <div style={{ paddingTop: 'var(--safe-top)', background: isBrutale ? 'var(--black, #0A0A0A)' : 'var(--violet, #2D1B69)', borderBottom: isBrutale ? '3px solid var(--accent)' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px var(--page-h)', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, minHeight: 44, minWidth: 44, cursor: 'pointer' }} aria-label="Retour">
            ←
          </button>
          <h2 style={{ fontFamily: 'var(--font-display)', color: isBrutale ? 'var(--accent)' : '#fff', flex: 1, fontSize: isBrutale ? 20 : 18, fontWeight: 700, textTransform: isBrutale ? 'uppercase' : 'none' }}>
            {isBrutale ? 'CONFIG PISCINE' : 'Configurer ma piscine'}
          </h2>
          {step === 'contour' && (
            <button
              onClick={() => setSnapAngles((v) => !v)}
              style={{ background: snapAngles ? accent : 'rgba(255,255,255,0.15)', border: 'none', color: snapAngles && isBrutale ? 'var(--ink, #0A0A0A)' : '#fff', borderRadius: isBrutale ? 0 : 'var(--radius-sm)', padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 36, fontFamily: 'var(--font-ui)' }}
            >
              ⊾ Snap
            </button>
          )}
        </div>
        <StepPills
          steps={stepConfig}
          onStepClick={(i) => { if (i < stepIndex) setStep(STEP_LABELS[i]) }}
        />
      </div>

      {/* SVG canvas */}
      <svg
        ref={svgRef}
        style={{ flex: 1, display: 'block', touchAction: 'none', cursor: polygon.closed && step === 'contour' ? 'default' : step === 'contour' ? 'crosshair' : 'default' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--faint)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {backgroundImage && (
          <image href={backgroundImage} x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" opacity={0.6} />
        )}

        {/* Contour layer — always visible */}
        {polygon.points.length > 0 && (
          <ContourLayer
            points={polygon.points}
            closed={polygon.closed}
            draggingIndex={draggingVertexIndex}
            width={svgSize.w}
            height={svgSize.h}
            onVertexPointerDown={step === 'contour' ? handleVertexPointerDown : () => {}}
          />
        )}

        {/* Depth zones layer — profondeurs step */}
        {step === 'profondeurs' && polygon.points.length >= 3 && (
          <DepthZonesLayer
            polygonPoints={polygon.points}
            zones={depthZones.zones}
            width={svgSize.w}
            height={svgSize.h}
            onSepPointerDown={handleSepPointerDown}
          />
        )}

        {/* Calibration line — calibrage step */}
        {step === 'calibrage' && (
          <g>
            {/* Line */}
            <line x1={cx1} y1={cy1} x2={cx2} y2={cy2}
              stroke="var(--calibration, rgba(190,150,230,0.65))"
              strokeWidth={3} strokeDasharray="8 4" />
            {/* Endpoints */}
            {([['p1', cx1, cy1], ['p2', cx2, cy2]] as const).map(([ep, ex, ey]) => (
              <g key={ep}>
                <circle cx={ex} cy={ey} r={14}
                  fill={isBrutale ? 'var(--accent)' : 'var(--aqua, #3DB8B8)'}
                  fillOpacity={0.2}
                  stroke={isBrutale ? 'var(--accent)' : 'var(--aqua, #3DB8B8)'}
                  strokeWidth={2}
                  style={{ cursor: 'grab', touchAction: 'none' }}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    svgRef.current?.setPointerCapture(e.pointerId)
                    setDraggingCalib(ep)
                    calibration.startDrag(ep)
                  }}
                />
                <text x={ex} y={ey + 4} textAnchor="middle"
                  fill={isBrutale ? 'var(--accent)' : 'var(--aqua, #3DB8B8)'}
                  fontSize={10} fontWeight={700} style={{ pointerEvents: 'none' }}>
                  {ep.toUpperCase()}
                </text>
              </g>
            ))}
            {/* Distance label */}
            {calibration.line.realLength && (
              <text
                x={(cx1 + cx2) / 2}
                y={(cy1 + cy2) / 2 - 12}
                textAnchor="middle"
                fill={isBrutale ? 'var(--accent)' : 'var(--aqua, #3DB8B8)'}
                fontSize={13} fontWeight={700}
                fontFamily="var(--font-ui)"
                style={{ pointerEvents: 'none' }}
              >
                {calibration.line.realLength} m
              </text>
            )}
          </g>
        )}
      </svg>

      {/* Magnifier */}
      {magnifier.active && (
        <div aria-hidden="true" style={{ position: 'fixed', left: magnifier.x * svgSize.w - 50, top: magnifier.y * svgSize.h - 120, width: 100, height: 100, borderRadius: isBrutale ? 0 : '50%', border: `3px solid ${accent}`, background: isBrutale ? '#1E1E1E' : '#fff', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--muted)' }}>
          <span style={{ transform: 'scale(3)', transformOrigin: 'center' }}>×3</span>
        </div>
      )}

      {/* Bottom sheet */}
      <div style={{ background: 'var(--bg)', borderRadius: isBrutale ? 0 : 'var(--radius-sheet) var(--radius-sheet) 0 0', borderTop: isBrutale ? '3px solid var(--accent)' : 'none', padding: '16px var(--page-h)', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', boxShadow: isBrutale ? 'none' : '0 -4px 20px rgba(0,0,0,0.1)' }}>

        {/* ── Contour step ── */}
        {step === 'contour' && (
          <>
            {detecting && <p style={{ color: isBrutale ? 'var(--accent)' : 'var(--accent)', fontSize: 14, marginBottom: 12, fontFamily: 'var(--font-ui)' }}>⏳ Détection du contour en cours…</p>}
            {detectError && <p style={{ color: isBrutale ? 'var(--red, #FF2D00)' : 'var(--peach, #FF7E5F)', fontSize: 14, marginBottom: 12, fontFamily: 'var(--font-ui)' }}>⚠ {detectError}</p>}
            {!detecting && !polygon.closed && !detectError && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12, fontFamily: 'var(--font-ui)' }}>
                Tracez le contour point par point.
                {polygon.points.length >= 3 && ' Tapez sur le 1er point pour fermer.'}
              </p>
            )}
            {!detecting && polygon.closed && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12, fontFamily: 'var(--font-ui)' }}>
                Contour validé — ajustez les points si nécessaire.
              </p>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              {polygon.points.length > 0 && (
                <button onClick={polygon.undo} style={btnSecondary}>Annuler</button>
              )}
              {!polygon.closed && polygon.points.length >= 3 && (
                <button onClick={polygon.closePolygon} style={btnCta}>
                  {isBrutale ? 'FERMER LE CONTOUR' : 'Fermer le contour'}
                </button>
              )}
              {polygon.closed && (
                <button onClick={() => setStep('profondeurs')} style={btnCta}>
                  {isBrutale ? 'PROFONDEURS →' : 'Définir les profondeurs →'}
                </button>
              )}
            </div>
          </>
        )}

        {/* ── Profondeurs step ── */}
        {step === 'profondeurs' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
                Glissez les séparateurs pour ajuster les zones.
              </p>
              <button onClick={depthZones.addZone} style={{ ...btnSecondary, padding: '0 12px', fontSize: 12, minHeight: 36 }}>
                + Zone
              </button>
            </div>

            {/* Depth zone inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, maxHeight: 160, overflowY: 'auto' }}>
              {depthZones.zones.map((zone, i) => (
                <div key={zone.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'var(--faint)', borderRadius: isBrutale ? 0 : 'var(--radius-sm)', border: isBrutale ? '1px solid var(--border-color)' : 'none' }}>
                  <div style={{ width: 12, height: 12, borderRadius: isBrutale ? 0 : 3, background: i === 0 ? (isBrutale ? '#555' : 'var(--depth-shallow, #B8E8E8)') : i === 1 ? (isBrutale ? '#333' : 'var(--depth-mid, #6ABABA)') : (isBrutale ? '#222' : 'var(--depth-deep, #1A3A60)'), flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', flex: 1 }}>Zone {i + 1}</span>
                  <label style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>Prof.</label>
                  <input
                    type="number" step="0.1" min="0.1" max="5"
                    value={zone.depthA}
                    onChange={(e) => depthZones.setDepth(zone.id, 'depthA', parseFloat(e.target.value) || 1)}
                    style={{ width: 52, minHeight: 32, padding: '0 6px', borderRadius: isBrutale ? 0 : 'var(--radius-xs)', border: `1px solid var(--border-color)`, fontSize: 13, fontWeight: 700, color: 'var(--text)', background: 'var(--bg)', fontFamily: 'var(--font-ui)', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>m</span>
                  {depthZones.zones.length > 1 && (
                    <button onClick={() => depthZones.removeZone(zone.id)} style={{ background: 'none', border: 'none', color: isBrutale ? 'var(--red, #FF2D00)' : 'var(--peach, #FF7E5F)', fontSize: 14, cursor: 'pointer', minHeight: 0, minWidth: 0, padding: '0 4px' }}>
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep('contour')} style={btnSecondary}>← Retour</button>
              <button onClick={() => setStep('calibrage')} style={btnCta}>
                {isBrutale ? 'CALIBRAGE →' : 'Calibrer les dimensions →'}
              </button>
            </div>
          </>
        )}

        {/* ── Calibrage step ── */}
        {step === 'calibrage' && (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, fontFamily: 'var(--font-ui)' }}>
              Placez les points P1 et P2 sur une longueur connue, puis saisissez la distance réelle.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap' }}>
                Distance réelle
              </label>
              <input
                type="number" step="0.1" min="0.1"
                value={calibDistInput}
                onChange={(e) => setCalibDistInput(e.target.value)}
                placeholder="ex. 8.5"
                style={{ flex: 1, minHeight: 44, padding: '0 12px', borderRadius: isBrutale ? 0 : 'var(--radius-md)', border: `${isBrutale ? '2px' : '1.5px'} solid ${calibDistInput ? 'var(--accent)' : 'var(--border-color)'}`, fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg)', fontFamily: 'var(--font-display)', textAlign: 'center' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
                onBlur={(e) => { if (!calibDistInput) e.target.style.borderColor = 'var(--border-color)' }}
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>m</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep('profondeurs')} style={btnSecondary}>← Retour</button>
              <button
                onClick={() => void handleCalculateVolume()}
                disabled={!calibDistInput || parseFloat(calibDistInput) <= 0}
                style={{ ...btnCta, opacity: (!calibDistInput || parseFloat(calibDistInput) <= 0) ? 0.5 : 1 }}
              >
                {isBrutale ? 'CALCULER LE VOLUME' : 'Calculer le volume →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Helper: geometry for separator drag ──────────────────────────────────────
function getZoneGeometry(points: Array<{x: number; y: number}>, svgW: number, svgH: number) {
  if (points.length < 3) return { polygonPoints: points, bb: { minX: 0, maxX: 1, minY: 0, maxY: 1 }, useHorizontal: true }
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const bb = { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
  const useHorizontal = (bb.maxX - bb.minX) * svgW >= (bb.maxY - bb.minY) * svgH
  return { polygonPoints: points, bb, useHorizontal }
}
