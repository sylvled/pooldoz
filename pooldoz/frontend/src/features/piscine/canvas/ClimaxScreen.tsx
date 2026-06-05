/**
 * ClimaxScreen — volume reveal celebration.
 *
 * Balnéa: cream bg, count-up animation, ripple waves, soft shadows.
 * Brutale: black bg, instant number, acid accent, geometric layout.
 *
 * CSS variables only.
 */
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '@/store/settings.store'

interface ClimaxScreenProps {
  volume: number
  zones?: Array<{ label: string; depth: number; volume: number }>
}

const DURATION_MS = 1600

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function formatFR(n: number) {
  return n.toFixed(1).replace('.', ',')
}

export function ClimaxScreen({ volume, zones }: ClimaxScreenProps) {
  const navigate = useNavigate()
  const isBrutale = useSettingsStore((s) => s.theme) === 'brutale'
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [displayed,        setDisplayed]        = useState(prefersReduced || isBrutale ? volume : 0)
  const [headlineVisible,  setHeadlineVisible]  = useState(prefersReduced || isBrutale)
  const [breakdownVisible, setBreakdownVisible] = useState(prefersReduced || isBrutale)
  const [promptVisible,    setPromptVisible]    = useState(prefersReduced || isBrutale)
  const [ctaVisible,       setCtaVisible]       = useState(prefersReduced || isBrutale)

  const frameRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const r1 = useRef<SVGEllipseElement>(null)
  const r2 = useRef<SVGEllipseElement>(null)
  const r3 = useRef<SVGEllipseElement>(null)

  useEffect(() => {
    if (prefersReduced || isBrutale) return

    // Count-up animation
    setTimeout(() => {
      function frame(ts: number) {
        if (!startRef.current) startRef.current = ts
        const t = Math.min((ts - startRef.current) / DURATION_MS, 1)
        setDisplayed(easeOutExpo(t) * volume)
        if (t < 1) { frameRef.current = requestAnimationFrame(frame) }
        else { setDisplayed(volume); setHeadlineVisible(true) }
      }
      frameRef.current = requestAnimationFrame(frame)
    }, 400)

    // Ripple animations
    function ripple(elRef: React.RefObject<SVGEllipseElement | null>, dur: number) {
      const el = elRef.current
      if (el == null) return
      const safeEl: SVGEllipseElement = el
      let start: number | null = null
      function f(now: number) {
        if (!start) start = now
        const t = Math.min((now - start) / dur, 1)
        const scale = 1 + t * 0.35
        const opacity = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8
        safeEl.style.transform = `scale(${scale})`
        safeEl.setAttribute('opacity', String(Math.max(0, opacity) * 0.8))
        if (t < 1) requestAnimationFrame(f)
        else { safeEl.setAttribute('opacity', '0'); setTimeout(() => ripple(elRef, dur), 400) }
      }
      requestAnimationFrame(f)
    }
    setTimeout(() => ripple(r1, 1200), 200)
    setTimeout(() => ripple(r2, 1400), 600)
    setTimeout(() => ripple(r3, 1600), 900)

    // Reveal sequence
    setTimeout(() => setBreakdownVisible(true), 2300)
    setTimeout(() => setPromptVisible(true),    2900)
    setTimeout(() => setCtaVisible(true),       3200)

    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [volume, prefersReduced, isBrutale])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', zIndex: 100 }}>

      {/* Header */}
      <div style={{
        padding: isBrutale ? '20px 20px 0' : '52px 24px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 2,
        borderBottom: isBrutale ? '3px solid var(--accent)' : 'none',
        background: isBrutale ? 'var(--primary)' : 'transparent',
      }}>
        {isBrutale ? (
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900, fontStyle: 'italic', color: 'var(--text)', textTransform: 'uppercase', lineHeight: 0.9, letterSpacing: '-2px' }}>
            POOL<span style={{ color: 'var(--accent)' }}>DOZ</span>
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ink, #1A0E2E)' }}>
            Pool<em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Doz</em>
          </div>
        )}
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: isBrutale ? 3 : 1.5, textTransform: 'uppercase', color: isBrutale ? 'var(--accent)' : 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
          {isBrutale ? 'CONFIG OK' : 'Configuration terminée'}
        </div>
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', position: 'relative' }}>

        {/* Ambient glow — Balnéa only */}
        {!isBrutale && (
          <div style={{ position: 'absolute', width: 300, height: 300, background: 'radial-gradient(circle, rgba(61,184,184,0.12) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-55%)', pointerEvents: 'none' }} />
        )}

        {/* Pool SVG */}
        <div style={{ position: 'relative', width: isBrutale ? 200 : 220, height: isBrutale ? 140 : 160, marginBottom: 28 }}>
          <svg viewBox="0 0 220 160" width={isBrutale ? 200 : 220} height={isBrutale ? 140 : 160} overflow="visible">
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={isBrutale ? '#3A3A3A' : '#B8E8E8'} stopOpacity={0.8} />
                <stop offset="100%" stopColor={isBrutale ? '#2A2A2A' : '#8DD8D8'} stopOpacity={0.9} />
              </linearGradient>
              <linearGradient id="dpg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={isBrutale ? '#1A1A1A' : '#3D7AB8'} stopOpacity={0.85} />
                <stop offset="100%" stopColor={isBrutale ? '#0A0A0A' : '#1A3A60'} stopOpacity={0.95} />
              </linearGradient>
              <filter id="glow3">
                <feGaussianBlur stdDeviation={isBrutale ? 0 : 3} result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <clipPath id="pc"><rect x={10} y={10} width={200} height={140} rx={isBrutale ? 0 : 10} /></clipPath>
            </defs>

            {/* Ripples — Balnéa only */}
            {!isBrutale && (
              <>
                <ellipse ref={r1} cx={110} cy={80} rx={115} ry={82} fill="none" stroke="rgba(61,184,184,0.22)" strokeWidth={1.5} opacity={0} style={{ transformOrigin: '110px 80px' }} />
                <ellipse ref={r2} cx={110} cy={80} rx={115} ry={82} fill="none" stroke="rgba(61,184,184,0.14)" strokeWidth={1}   opacity={0} style={{ transformOrigin: '110px 80px' }} />
                <ellipse ref={r3} cx={110} cy={80} rx={115} ry={82} fill="none" stroke="rgba(61,184,184,0.08)" strokeWidth={1}   opacity={0} style={{ transformOrigin: '110px 80px' }} />
              </>
            )}

            <g clipPath="url(#pc)">
              <rect x={10} y={10}  width={200} height={60}  fill="url(#sg)" />
              <rect x={10} y={70}  width={200} height={80}  fill="url(#dpg)" />
            </g>
            <rect x={10} y={10} width={200} height={140} rx={isBrutale ? 0 : 10}
              fill="none" stroke={isBrutale ? '#D4FF00' : '#3DB8B8'} strokeWidth={isBrutale ? 3 : 2}
              filter="url(#glow3)" opacity={0.7} />

            <text x={110} y={44}  textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize={9} fontWeight={600} fill={isBrutale ? '#D4FF00' : 'white'} opacity={0.85}>Petite plage · 1,2 m</text>
            <text x={110} y={118} textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize={9} fontWeight={600} fill={isBrutale ? '#D4FF00' : 'white'} opacity={0.85}>Grand bain · 1,8 m</text>
          </svg>
        </div>

        {/* Volume number */}
        <div style={{ textAlign: 'center', marginBottom: 12, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: isBrutale ? 3 : 2, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'var(--font-ui)' }}>
            Volume de votre piscine
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: isBrutale ? 96 : 72,
            fontWeight: isBrutale ? 900 : 700,
            color: 'var(--text)',
            lineHeight: 1, letterSpacing: -2,
            display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6,
            textTransform: isBrutale ? 'uppercase' : 'none',
          }}>
            <span>{formatFR(displayed)}</span>
            <span style={{ fontSize: isBrutale ? 40 : 28, fontWeight: 600, fontStyle: isBrutale ? 'normal' : 'italic', color: 'var(--accent)' }}>m³</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontStyle: isBrutale ? 'normal' : 'italic',
            fontSize: isBrutale ? 14 : 17,
            color: 'var(--text-secondary)',
            marginTop: 8,
            opacity: headlineVisible ? 1 : 0,
            transform: headlineVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
            textTransform: isBrutale ? 'uppercase' : 'none',
            letterSpacing: isBrutale ? '2px' : 'normal',
          }}>
            {isBrutale ? 'PROFIL TERMINÉ' : 'Votre piscine n\'a plus de secrets !'}
          </div>
        </div>

        {/* Breakdown */}
        {zones && (
          <div style={{
            width: '100%',
            background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'white',
            borderRadius: isBrutale ? 0 : 'var(--radius-lg)',
            padding: '16px 18px',
            boxShadow: isBrutale ? 'none' : 'var(--shadow-sm)',
            border: isBrutale ? '1px solid var(--border-color)' : 'none',
            position: 'relative', zIndex: 1,
            opacity: breakdownVisible ? 1 : 0,
            transform: breakdownVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 10, fontFamily: 'var(--font-ui)' }}>Détail du calcul</div>
            {zones.map((z, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: isBrutale ? 0 : 3, background: i === 0 ? (isBrutale ? '#555' : '#B8E8E8') : i === 1 ? (isBrutale ? '#333' : '#6ABABA') : (isBrutale ? '#222' : '#3D7AB8'), flexShrink: 0, border: isBrutale ? '1px solid var(--border-color)' : 'none' }} />
                <div style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>{z.label} · {z.depth} m</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{formatFR(z.volume)} m³</div>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--border-color)', margin: '6px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-ui)' }}>Volume total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{formatFR(volume)} m³</span>
            </div>
          </div>
        )}
      </div>

      {/* Account prompt */}
      <div style={{
        margin: '12px 20px 0',
        background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'linear-gradient(135deg, rgba(45,27,105,0.06) 0%, rgba(61,184,184,0.06) 100%)',
        border: isBrutale ? '2px solid var(--accent)' : '1px solid rgba(61,184,184,0.2)',
        borderRadius: isBrutale ? 0 : 'var(--radius-lg)',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        opacity: promptVisible ? 1 : 0,
        transform: promptVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        position: 'relative', zIndex: 2,
      }}>
        <div style={{ width: 36, height: 36, background: isBrutale ? 'var(--accent)' : 'rgba(61,184,184,0.12)', borderRadius: isBrutale ? 0 : 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>☁️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: isBrutale ? 'var(--accent)' : 'var(--text)', marginBottom: 1, fontFamily: 'var(--font-ui)', textTransform: isBrutale ? 'uppercase' : 'none', letterSpacing: isBrutale ? '0.5px' : 'normal' }}>Protégez ce profil</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>Créez un compte pour ne jamais le perdre</div>
        </div>
        <button onClick={() => navigate('/auth/register')} style={{
          background: isBrutale ? 'var(--accent)' : 'var(--accent)',
          color: isBrutale ? 'var(--ink, #0A0A0A)' : 'white',
          border: 'none', borderRadius: isBrutale ? 0 : 10,
          padding: '7px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--font-ui)', textTransform: isBrutale ? 'uppercase' : 'none',
          letterSpacing: isBrutale ? '1px' : 'normal', minHeight: 0, minWidth: 0,
        }}>
          {isBrutale ? 'CRÉER' : 'Créer'}
        </button>
      </div>

      {/* CTA */}
      <div style={{
        padding: '12px 20px 32px',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
        opacity: ctaVisible ? 1 : 0,
        transform: ctaVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline', width: '100%', textAlign: 'center', marginBottom: 10, fontFamily: 'var(--font-ui)', minHeight: 0 }}>
          Plus tard
        </button>
        <button onClick={() => navigate('/')} style={{
          width: '100%', border: isBrutale ? '3px solid var(--accent)' : 'none',
          borderRadius: isBrutale ? 0 : 'var(--radius-md)',
          padding: 17, fontFamily: 'var(--font-ui)', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          background: isBrutale ? 'var(--accent)' : 'linear-gradient(135deg, var(--aqua, #3DB8B8) 0%, var(--aqua-deep, #2A9090) 100%)',
          color: isBrutale ? 'var(--ink, #0A0A0A)' : 'white',
          boxShadow: isBrutale ? '4px 4px 0 var(--ink, #0A0A0A)' : 'var(--shadow-cta)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          animation: !isBrutale ? 'breathe 3s ease-in-out infinite 3.5s both' : 'none',
          textTransform: isBrutale ? 'uppercase' : 'none',
          letterSpacing: isBrutale ? '1px' : 'normal',
          minHeight: 52,
        }}>
          Commencer à doser →
        </button>
      </div>
    </div>
  )
}
