import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'

/**
 * Persistent banner for non-authenticated users.
 * "Plus tard" hides for the session — never blocks the app.
 */
export function AccountPrompt() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [dismissed, setDismissed] = useState(false)

  if (user || dismissed) return null

  return (
    <div
      role="complementary"
      aria-label="Sauvegarde cloud"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: 'var(--faint)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, marginBottom: 2 }}>
          Données non sauvegardées
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Créez un compte pour retrouver vos piscines partout.
        </p>
      </div>
      <button
        onClick={() => navigate('/auth/register')}
        style={{
          padding: '8px 14px',
          background: 'var(--aqua)',
          color: '#fff',
          borderRadius: 'var(--radius-lg)',
          border: 'none',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          minHeight: 44,
          flexShrink: 0,
        }}
      >
        Créer
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Plus tard"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          fontSize: 18,
          cursor: 'pointer',
          minHeight: 44,
          minWidth: 44,
          padding: 0,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}
