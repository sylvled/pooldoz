import type { DoseResult as DoseResultType } from '@/lib/chemistry'

interface DoseResultProps {
  result: DoseResultType | null
  produitLabel: string
}

const STATUS_COLOR: Record<string, string> = {
  optimal: 'var(--aqua)',
  low: 'var(--peach)',
  high: 'var(--peach)',
  critical: '#ff2d00',
}

export function DoseResult({ result, produitLabel }: DoseResultProps) {
  if (!result) {
    return (
      <div style={styles.card}>
        <span style={{ color: 'var(--muted)', fontSize: 28, fontWeight: 700 }}>—</span>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
          Saisissez votre taux pour obtenir le dosage
        </p>
      </div>
    )
  }

  if (result.optimal) {
    return (
      <div style={{ ...styles.card, border: '2px solid var(--aqua)' }}>
        <span style={{ fontSize: 32 }}>✓</span>
        <p style={{ color: 'var(--aqua)', fontWeight: 700, fontSize: 16, marginTop: 4 }}>
          Aucun ajout nécessaire
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>
          Le taux de {produitLabel.toLowerCase()} est optimal.
        </p>
      </div>
    )
  }

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 44,
            color: STATUS_COLOR[result.status] ?? 'var(--text)',
            lineHeight: 1,
          }}
        >
          {result.dose?.toFixed(1)}
        </span>
        <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' }}>
          {result.unit}
        </span>
      </div>

      {result.conditionnements.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {result.conditionnements.map((c) => (
            <span key={c} style={styles.badge}>{c}</span>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    padding: '16px 20px',
    background: 'var(--bg)',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-sm)',
    textAlign: 'center' as const,
  },
  badge: {
    padding: '4px 10px',
    background: 'var(--faint)',
    borderRadius: 'var(--radius-full)',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text)',
  },
}
