/**
 * SeasonBanner — seasonal reminder (May: opening, September: winterizing).
 * Shown if no session in 6+ months. CSS variables only.
 */
import { useSettingsStore } from '@/store/settings.store'

interface SeasonBannerProps {
  onDismiss: () => void
}

export function SeasonBanner({ onDismiss }: SeasonBannerProps) {
  const isBrutale = useSettingsStore((s) => s.theme) === 'brutale'
  const month = new Date().getMonth() + 1
  const isOpening = month === 5
  const icon    = isOpening ? '🌞' : '❄️'
  const message = isOpening
    ? "C'est l'ouverture de la saison ! Vérifiez la chimie de votre piscine."
    : "Pensez à hiverner votre piscine avant les gelées."

  return (
    <div role="alert" style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 16px',
      background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'var(--violet-mid, #3D2888)',
      borderRadius: isBrutale ? 0 : 'var(--radius-card)',
      boxShadow: isBrutale ? 'none' : 'var(--shadow-sm)',
      border: isBrutale ? '2px solid var(--accent)' : 'none',
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
      <p style={{ color: isBrutale ? 'var(--accent)' : '#fff', fontSize: 14, lineHeight: 1.5, flex: 1, fontFamily: 'var(--font-ui)', textTransform: isBrutale ? 'uppercase' : 'none', letterSpacing: isBrutale ? '0.5px' : 'normal' }}>
        {message}
      </p>
      <button
        onClick={onDismiss}
        aria-label="Fermer le rappel"
        style={{ background: 'none', border: 'none', color: isBrutale ? 'var(--accent)' : 'rgba(255,255,255,0.7)', fontSize: 20, cursor: 'pointer', minHeight: 44, minWidth: 44, padding: 0, flexShrink: 0 }}
      >
        ×
      </button>
    </div>
  )
}
