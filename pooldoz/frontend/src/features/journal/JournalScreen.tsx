/**
 * JournalScreen — dosage session history.
 * CSS variables only. Dual-theme via var(--accent), var(--bg), etc.
 */
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { usePiscineStore } from '@/features/piscine/piscine.store'
import { useSettingsStore } from '@/store/settings.store'
import { PRODUIT_LABELS, PRODUIT_UNITS } from '@/features/dosage/dosage.store'
import type { Produit } from '@/lib/chemistry'

export function JournalScreen() {
  const isBrutale = useSettingsStore((s) => s.theme) === 'brutale'
  const { piscines, activePiscineId } = usePiscineStore()
  const [filterPiscineId, setFilterPiscineId] = useState<string | null>(activePiscineId)

  const sessions = useLiveQuery(
    () =>
      filterPiscineId
        ? db.sessions.where('piscineId').equals(filterPiscineId).reverse().sortBy('createdAt')
        : db.sessions.orderBy('createdAt').reverse().toArray(),
    [filterPiscineId],
  )

  const piscineNom = (id: string) => piscines.find((p) => p.id === id)?.nom ?? '—'

  return (
    <div style={{
      padding: 'var(--page-h)',
      paddingTop: 'calc(var(--safe-top) + 8px)',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
      background: 'var(--bg)',
      minHeight: '100dvh',
    }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: isBrutale ? 36 : 24,
          fontWeight: 700,
          color: isBrutale ? 'var(--accent)' : 'var(--text)',
          textTransform: isBrutale ? 'uppercase' : 'none',
        }}>
          {isBrutale ? 'JOURNAL' : 'Journal'}
        </h1>

        {piscines.length > 1 && (
          <select
            value={filterPiscineId ?? ''}
            onChange={(e) => setFilterPiscineId(e.target.value || null)}
            style={{
              padding: '6px 12px',
              borderRadius: isBrutale ? 0 : 'var(--radius-lg)',
              border: isBrutale ? '1px solid var(--border-color)' : '1.5px solid var(--border-color)',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer', minHeight: 36,
              fontFamily: 'var(--font-ui)',
            }}
          >
            <option value="">Toutes les piscines</option>
            {piscines.map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        )}
      </header>

      {(!sessions || sessions.length === 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50dvh', textAlign: 'center', gap: 12 }}>
          <span style={{ fontSize: 48 }}>📋</span>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontFamily: 'var(--font-ui)' }}>
            Aucune session enregistrée — faites votre premier dosage !
          </p>
        </div>
      )}

      {sessions && sessions.length > 0 && (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessions.map((s) => {
            const label = PRODUIT_LABELS[s.produit as Produit] ?? s.produit
            const unit  = PRODUIT_UNITS[s.produit as Produit] ?? ''
            const date  = new Date(s.createdAt)
            const formattedDate = new Intl.DateTimeFormat('fr-FR', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            }).format(date)

            return (
              <li key={s.id} style={{
                background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'var(--bg)',
                borderRadius: isBrutale ? 0 : 'var(--radius-card)',
                padding: '14px 18px',
                boxShadow: isBrutale ? 'none' : 'var(--shadow-xs)',
                border: isBrutale ? '1px solid var(--border-color)' : 'none',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 40, height: 40,
                  borderRadius: isBrutale ? 0 : 'var(--radius-full)',
                  background: 'var(--faint)',
                  border: isBrutale ? '2px solid var(--accent)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 12,
                  color: 'var(--accent)',
                  flexShrink: 0,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.04em',
                  fontFamily: 'var(--font-ui)',
                }}>
                  {label.slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', fontFamily: 'var(--font-ui)' }}>{label}</span>
                    {s.tauxMesure != null && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'var(--font-ui)' }}>
                        {s.tauxMesure} {unit}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    {piscines.length > 1 && (
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'var(--font-ui)' }}>
                        {piscineNom(s.piscineId)}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
                      {formattedDate}
                    </span>
                  </div>
                </div>
                {s.dose != null && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: isBrutale ? 'normal' : 'italic',
                      fontWeight: 700, fontSize: 20,
                      color: 'var(--accent)',
                      textTransform: isBrutale ? 'uppercase' : 'none',
                    }}>
                      {s.dose.toFixed(1)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 3, fontFamily: 'var(--font-ui)' }}>kg</span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
