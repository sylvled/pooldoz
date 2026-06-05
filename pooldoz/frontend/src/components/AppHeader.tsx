/**
 * AppHeader — reusable header component.
 *
 * Balnéa: violet bg + animated blobs + cream Bézier curve at bottom.
 * Brutale: black bg + 3px acid border-bottom + no blobs + no curve + huge Barlow italic logo.
 *
 * Always uses CSS variables only — never hardcoded values.
 */
import type { ReactNode } from 'react'
import { useSettingsStore } from '@/store/settings.store'
import { useThemeLongPress } from '@/hooks/useTheme'

interface AppHeaderProps {
  poolPill?: string | null
  children?: ReactNode
  noCurve?: boolean
  onPoolPillClick?: () => void
}

export function AppHeader({ poolPill, children, noCurve, onPoolPillClick }: AppHeaderProps) {
  const theme = useSettingsStore((s) => s.theme)
  const isBrutale = theme === 'brutale'
  const { startPress, cancelPress } = useThemeLongPress()

  return (
    <header style={{
      background: 'var(--primary)',
      borderBottom: isBrutale ? '3px solid var(--accent)' : 'none',
      padding: isBrutale ? '20px 20px 0' : '52px 24px 44px',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
    }}>

      {/* Animated blobs — Balnéa only */}
      {!isBrutale && (
        <>
          <div aria-hidden="true" style={{
            position: 'absolute', width: 140, height: 140,
            background: 'rgba(61,184,184,0.20)',
            borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
            top: -30, right: -20,
            animation: 'hdr-blob1 9s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', width: 70, height: 70,
            background: 'rgba(255,126,95,0.18)',
            borderRadius: '48% 52% 62% 38% / 44% 56% 44% 56%',
            bottom: -10, left: 30,
            animation: 'hdr-blob2 12s ease-in-out infinite reverse',
            pointerEvents: 'none',
          }} />
        </>
      )}

      {/* Inner content */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: isBrutale ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: isBrutale ? 0 : 12 }}>

          {/* Logo — Balnéa: compact serif / Brutale: giant condensed italic */}
          {isBrutale ? (
            <div
              style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 900, fontStyle: 'italic', color: 'var(--text)', lineHeight: 0.9, letterSpacing: '-2px', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', touchAction: 'none' }}
              onPointerDown={startPress}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
              title="Appui long pour changer de thème"
            >
              POOL<span style={{ color: 'var(--accent)' }}>DOZ</span>
            </div>
          ) : (
            <div
              style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px', cursor: 'pointer', userSelect: 'none', touchAction: 'none' }}
              onPointerDown={startPress}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
              title="Appui long pour changer de thème"
            >
              Pool<em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Doz</em>
            </div>
          )}

          {/* Pool identifier */}
          {poolPill && (
            isBrutale ? (
              <button onClick={onPoolPillClick} style={{
                background: 'var(--accent)',
                color: 'var(--ink)',
                fontSize: 9, fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                padding: '4px 8px',
                marginTop: 8,
                border: 'none',
                cursor: onPoolPillClick ? 'pointer' : 'default',
                display: 'inline-block',
                fontFamily: 'var(--font-ui)',
                minHeight: 0,
                minWidth: 0,
              }}>
                {poolPill}
              </button>
            ) : (
              <button onClick={onPoolPillClick} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 20,
                padding: '5px 12px',
                fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 500,
                cursor: onPoolPillClick ? 'pointer' : 'default',
                minHeight: 0,
                fontFamily: 'var(--font-ui)',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--accent)',
                  boxShadow: '0 0 6px var(--accent)',
                  animation: 'pool-dot-pulse 2.5s ease-in-out infinite',
                  flexShrink: 0,
                  display: 'block',
                }} aria-hidden="true" />
                {poolPill}
              </button>
            )
          )}
        </div>

        {/* Brutale header tabs (nav inline) */}
        {isBrutale && (
          <div style={{ display: 'flex', marginTop: 16 }}>
            {['Dosage', 'Piscine', 'Journal', 'Réglages'].map((label) => (
              <div key={label} style={{
                flex: 1, padding: '10px 4px', textAlign: 'center',
                fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-ui)',
              }}>
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Slot content (greeting, title…) */}
        {children && !isBrutale && (
          <div style={{ marginTop: 8 }}>
            {children}
          </div>
        )}
      </div>

      {/* Cream Bézier curve — Balnéa only */}
      {!isBrutale && !noCurve && (
        <div style={{
          position: 'absolute', bottom: -1, left: 0, right: 0, height: 50,
          pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 375 50" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
            <path d="M0,0 C90,50 285,50 375,0 L375,50 L0,50 Z" fill="var(--bg)" />
          </svg>
        </div>
      )}

      <style>{`
        @keyframes hdr-blob1 {
          0%,100% { border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%; }
          50%      { border-radius: 42% 58% 45% 55% / 58% 42% 58% 42%; }
        }
        @keyframes hdr-blob2 {
          0%,100% { border-radius: 48% 52% 62% 38% / 44% 56% 44% 56%; }
          50%      { border-radius: 62% 38% 42% 58% / 55% 45% 55% 45%; }
        }
        @keyframes pool-dot-pulse {
          0%,100% { box-shadow: 0 0 4px var(--accent); }
          50%      { box-shadow: 0 0 12px var(--accent), 0 0 20px rgba(61,184,184,0.4); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-theme="balnea"] .hdr-blob1,
          [data-theme="balnea"] .hdr-blob2 { animation: none !important; }
        }
      `}</style>
    </header>
  )
}
