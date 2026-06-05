/**
 * ProductWheel — SVG rotary product selector.
 *
 * Exact port of dosage-wheel-balnea.html mockup logic.
 *
 * Balnéa: easeOutCubic, tap=420ms, drag-release=320ms.
 * Brutale: easeInQuart, snap instantané ~250ms.
 * prefers-reduced-motion: snap instantané (duration=0).
 *
 * CSS variables only — no hardcoded colors in non-SVG parts.
 */
import { useRef, useState, useCallback, useEffect } from 'react'
import { useSettingsStore } from '@/store/settings.store'
import { PRODUITS, PRODUIT_LABELS, useDosageStore } from './dosage.store'

const N = PRODUITS.length
const STEP = 360 / N
const CX = 130, CY = 130, OUTER_R = 118, INNER_R = 56

const PROD_ICONS: Record<string, string> = {
  sel: '🧂', chlore: '⚡', ph_plus: '↑', ph_moins: '↓',
  tac: '◉', algicide: '🌿', stabilisant: '🛡',
}

// Product accent colors (SVG only — not CSS variables for SVG fill compatibility)
const PROD_COLORS: Record<string, string> = {
  sel: '#3DB8B8', chlore: '#F0C040', ph_plus: '#FF8C42', ph_moins: '#66BB6A',
  tac: '#AB47BC', algicide: '#26A69A', stabilisant: '#5C8DD4',
}
// Brutale product colors — acid for selected, gray for others
const PROD_COLORS_BRUTALE: Record<string, string> = {
  sel: '#D4FF00', chlore: '#D4FF00', ph_plus: '#D4FF00', ph_moins: '#D4FF00',
  tac: '#D4FF00', algicide: '#D4FF00', stabilisant: '#D4FF00',
}

function polarToCart(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg - 90) * Math.PI / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3) }
function easeInQuart(t: number)  { return t * t * t * t }

function arcPath(r: number, a1: number, a2: number): string {
  const [s0, s1] = polarToCart(CX, CY, r, a1)
  const [e0, e1] = polarToCart(CX, CY, r, a2)
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0
  return `M ${s0} ${s1} A ${r} ${r} 0 ${large} 1 ${e0} ${e1}`
}

export function ProductWheel({ suggestedIndex }: { suggestedIndex?: number }) {
  const theme = useSettingsStore((s) => s.theme)
  const isBrutale = theme === 'brutale'
  const { produitActif, setProduit } = useDosageStore()
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Angle state mirrors mockup's `currentAngle`
  const angleRef  = useRef(0)
  const selIdxRef = useRef(0)
  const animRef   = useRef<number | null>(null)
  const isAnimRef = useRef(false)
  const wrapRef   = useRef<HTMLDivElement>(null)

  const [angle,  setAngle]  = useState(0)
  const [selIdx, setSelIdx] = useState(0)

  const dragRef = useRef<{
    startAngle: number; startRot: number
    startX: number; startY: number; maxDist: number
  } | null>(null)

  // ── Helpers ───────────────────────────────────────────────────────────────

  function nearestIndex(rot: number): number {
    let best = 0, bestDist = Infinity
    for (let i = 0; i < N; i++) {
      let a = ((i * STEP + STEP / 2 + rot) % 360 + 360) % 360
      if (a > 180) a -= 360
      if (Math.abs(a) < bestDist) { bestDist = Math.abs(a); best = i }
    }
    return best
  }

  function snapTo(targetIdx: number) {
    const targetAngle = -(targetIdx * STEP + STEP / 2)
    angleRef.current = targetAngle
    selIdxRef.current = targetIdx
    setAngle(targetAngle)
    setSelIdx(targetIdx)
    setProduit(PRODUITS[targetIdx])
  }

  function animateToIndex(targetIdx: number, duration: number) {
    if (isAnimRef.current && animRef.current) {
      cancelAnimationFrame(animRef.current)
      isAnimRef.current = false
    }

    // Instant snap
    if (duration <= 0 || prefersReduced) { snapTo(targetIdx); return }

    const targetAngle = -(targetIdx * STEP + STEP / 2)
    let delta = targetAngle - angleRef.current
    while (delta > 180)  delta -= 360
    while (delta < -180) delta += 360
    if (Math.abs(delta) < 0.5) { snapTo(targetIdx); return }

    const startAngle = angleRef.current
    const startTime  = performance.now()
    isAnimRef.current = true

    // Balnéa uses easeOutCubic (soft decel), Brutale uses easeInQuart (sharp then instant)
    const easeFn = isBrutale ? easeInQuart : easeOutCubic

    function frame(now: number) {
      const t = Math.min((now - startTime) / duration, 1)
      const newAngle = startAngle + delta * easeFn(t)
      angleRef.current = newAngle

      // Track nearest index during flight
      let best = 0, bestD = Infinity
      for (let i = 0; i < N; i++) {
        let a = ((i * STEP + STEP / 2 + newAngle) % 360 + 360) % 360
        if (a > 180) a -= 360
        if (Math.abs(a) < bestD) { bestD = Math.abs(a); best = i }
      }
      setAngle(newAngle)
      setSelIdx(best)
      setProduit(PRODUITS[best])

      if (t < 1) {
        animRef.current = requestAnimationFrame(frame)
      } else {
        angleRef.current = startAngle + delta
        isAnimRef.current = false
        snapTo(targetIdx)
      }
    }
    animRef.current = requestAnimationFrame(frame)
  }

  // Init: snap to active product
  useEffect(() => {
    animateToIndex(PRODUITS.indexOf(produitActif), 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Pointer angle helper ──────────────────────────────────────────────────

  function getPointerAngle(clientX: number, clientY: number): number {
    if (!wrapRef.current) return 0
    const rect = wrapRef.current.getBoundingClientRect()
    return Math.atan2(clientY - rect.top - CY, clientX - rect.left - CX) * 180 / Math.PI
  }

  // ── Drag handlers (port of mockup startDrag / onDrag / endDrag) ───────────

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isAnimRef.current && animRef.current) {
      cancelAnimationFrame(animRef.current)
      isAnimRef.current = false
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      startAngle: getPointerAngle(e.clientX, e.clientY),
      startRot:   angleRef.current,
      startX:     e.clientX,
      startY:     e.clientY,
      maxDist:    0,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const d = Math.hypot(e.clientX - dragRef.current.startX, e.clientY - dragRef.current.startY)
    if (d > dragRef.current.maxDist) dragRef.current.maxDist = d
    const newAngle = dragRef.current.startRot + getPointerAngle(e.clientX, e.clientY) - dragRef.current.startAngle
    angleRef.current = newAngle
    setAngle(newAngle)
    setSelIdx(nearestIndex(newAngle))
    setProduit(PRODUITS[nearestIndex(newAngle)])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setProduit])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const drag = dragRef.current
    dragRef.current = null

    // Brutale tap duration
    const tapDur  = isBrutale ? 250 : 420
    const dragDur = isBrutale ? 250 : 320

    if (drag.maxDist < 8) {
      // TAP — find tapped segment
      if (!wrapRef.current) return
      const rect  = wrapRef.current.getBoundingClientRect()
      const tx    = e.clientX - rect.left - CX
      const ty    = e.clientY - rect.top  - CY
      const dist  = Math.hypot(tx, ty)

      if (dist > INNER_R && dist < OUTER_R + 12) {
        let tapAngle = (Math.atan2(ty, tx) * 180 / Math.PI + 90 + 360) % 360
        let best = 0, bestDist = Infinity
        for (let i = 0; i < N; i++) {
          let center = ((i * STEP + STEP / 2 + angleRef.current) % 360 + 360) % 360
          let diff = Math.abs(tapAngle - center)
          if (diff > 180) diff = 360 - diff
          if (diff < bestDist) { bestDist = diff; best = i }
        }
        animateToIndex(best, tapDur)
      } else {
        animateToIndex(nearestIndex(angleRef.current), tapDur)
      }
    } else {
      animateToIndex(nearestIndex(angleRef.current), dragDur)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBrutale])

  // ── SVG construction (mirrors mockup buildWheel) ──────────────────────────

  const labelR   = (INNER_R + OUTER_R) / 2
  const halfStep = STEP / 2

  // Ring/hole colors — Brutale uses dark palette
  const ringColor1 = isBrutale ? '#1A1A1A' : '#3D2888'
  const ringColor2 = isBrutale ? '#0A0A0A' : '#1E0F4A'
  const holeColor  = isBrutale ? '#0A0A0A' : '#FFF4EE'
  const windowColor = isBrutale ? '#D4FF00' : '#3DB8B8'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <p style={{
        fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
        color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 12,
        fontFamily: 'var(--font-ui)',
      }}>
        Tournez pour choisir
      </p>

      <div
        ref={wrapRef}
        style={{ position: 'relative', width: 260, height: 260, cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <svg viewBox="0 0 260 260" width={260} height={260} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <radialGradient id="pw-ring" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={ringColor1} />
              <stop offset="100%" stopColor={ringColor2} />
            </radialGradient>
            <filter id="pw-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Shadow */}
          <circle cx={CX} cy={CY} r={OUTER_R + 4} fill="rgba(0,0,0,0.2)" filter="url(#pw-glow)" />

          {/* Ring */}
          <circle cx={CX} cy={CY} r={OUTER_R} fill="url(#pw-ring)" />

          {/* Hole */}
          <circle cx={CX} cy={CY} r={INNER_R} fill={holeColor} />

          {/* Segment dividers — angle = i * STEP + currentAngle */}
          {Array.from({ length: N }).map((_, i) => {
            const ang = i * STEP + angle
            const [x1, y1] = polarToCart(CX, CY, INNER_R + 2, ang)
            const [x2, y2] = polarToCart(CX, CY, OUTER_R - 2, ang)
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isBrutale ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}
                strokeWidth={isBrutale ? 2 : 1} />
            )
          })}

          {/* Labels — angle = i * STEP + currentAngle + STEP/2 */}
          {PRODUITS.map((p, i) => {
            const ang = i * STEP + angle + STEP / 2
            const [lx, ly] = polarToCart(CX, CY, labelR, ang)
            const isSel = i === selIdx
            const selColor = isBrutale
              ? (isSel ? PROD_COLORS_BRUTALE[p] : 'rgba(255,255,255,0.35)')
              : (isSel ? PROD_COLORS[p] : 'rgba(255,255,255,0.55)')
            return (
              <g key={p}>
                {suggestedIndex === i && (
                  <circle cx={lx + 14} cy={ly - 18} r={4} fill={windowColor} />
                )}
                <text x={lx} y={ly - 9} textAnchor="middle" dominantBaseline="middle"
                  fontSize={isSel ? 18 : 14}
                  fill={selColor}
                  fontFamily="system-ui, sans-serif"
                  style={{ pointerEvents: 'none' }}>
                  {PROD_ICONS[p]}
                </text>
                <text x={lx} y={ly + 11} textAnchor="middle" dominantBaseline="middle"
                  fontSize={isSel ? 10 : 9} fontWeight={isSel ? 700 : 500}
                  fontFamily={isBrutale ? '"IBM Plex Mono", monospace' : '"Plus Jakarta Sans", sans-serif'}
                  fill={isSel ? (isBrutale ? '#D4FF00' : 'white') : (isBrutale ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.45)')}
                  letterSpacing={isBrutale ? '1' : '0.5'}
                  style={{ pointerEvents: 'none' }}>
                  {PRODUIT_LABELS[p]}
                </text>
              </g>
            )
          })}

          {/* Window arcs — fixed at 12h, not rotating */}
          <path d={arcPath(OUTER_R + 3, -halfStep, halfStep)}
            stroke={windowColor} strokeWidth={isBrutale ? 6 : 4}
            fill="none" strokeLinecap={isBrutale ? 'square' : 'round'} opacity="0.9" />
          <path d={arcPath(INNER_R - 3, -halfStep, halfStep)}
            stroke={windowColor} strokeWidth={isBrutale ? 3 : 2.5}
            fill="none" strokeLinecap={isBrutale ? 'square' : 'round'} opacity="0.6" />
          {[-halfStep, halfStep].map((ang, i) => {
            const [xi, yi] = polarToCart(CX, CY, INNER_R - 2, ang)
            const [xo, yo] = polarToCart(CX, CY, OUTER_R + 2, ang)
            return (
              <line key={i} x1={xi} y1={yi} x2={xo} y2={yo}
                stroke={windowColor} strokeWidth={isBrutale ? 2 : 1.5} opacity="0.7" />
            )
          })}

          {/* Ring borders */}
          <circle cx={CX} cy={CY} r={OUTER_R} fill="none"
            stroke={isBrutale ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'} strokeWidth="1" />
          <circle cx={CX} cy={CY} r={INNER_R} fill="none"
            stroke={isBrutale ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'} strokeWidth="1" />
        </svg>

        {/* Center info circle */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 96, height: 96,
          background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'var(--cream, #FFF4EE)',
          borderRadius: isBrutale ? 0 : '50%',
          border: isBrutale ? '2px solid var(--accent)' : 'none',
          boxShadow: isBrutale ? 'none' : '0 4px 20px rgba(45,27,105,0.18), 0 0 0 3px rgba(61,184,184,0.2)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 2, pointerEvents: 'none', zIndex: 5,
        }}>
          <span style={{ fontSize: 28, lineHeight: 1 }}>
            {PROD_ICONS[produitActif]}
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: isBrutale ? 11 : 13,
            fontWeight: 700,
            color: isBrutale ? 'var(--accent)' : 'var(--ink, #1A0E2E)',
            textTransform: isBrutale ? 'uppercase' : 'none',
            letterSpacing: isBrutale ? '1px' : 'normal',
          }}>
            {PRODUIT_LABELS[produitActif]}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 600, letterSpacing: 1,
            textTransform: 'uppercase',
            color: isBrutale ? 'rgba(212,255,0,0.5)' : 'var(--muted, #8B7BA8)',
            fontFamily: 'var(--font-ui)',
          }}>
            Mesurer
          </span>
        </div>
      </div>
    </div>
  )
}
