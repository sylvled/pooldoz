import { useMemo } from 'react'
import { useDosageStore, PRODUIT_LABELS } from './dosage.store'
import { calculateDose } from '@/lib/chemistry'
import type { Produit } from '@/lib/chemistry'
import { usePiscineStore } from '@/features/piscine/piscine.store'
import { DoseResult } from './DoseResult'

export function PreventivePanel({ onConfirm }: { onConfirm: (dose: ReturnType<typeof calculateDose>) => void }) {
  const { produitActif } = useDosageStore()
  const { piscines, activePiscineId } = usePiscineStore()
  const activePiscine = piscines.find((p) => p.id === activePiscineId)
  const volumeM3 = activePiscine?.volume ?? 50

  const result = useMemo(
    () =>
      calculateDose({
        produit: produitActif as Produit,
        tauxMesure: 0,
        tauxCible: 0,
        volumeM3,
      }),
    [produitActif, volumeM3],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 var(--page-h)' }}>
      <div style={noteStyle}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          La dose d&apos;{PRODUIT_LABELS[produitActif].toLowerCase()} est calculée directement
          sur le volume de votre piscine ({volumeM3.toFixed(1)} m³).
          Aucune mesure préalable requise.
        </p>
      </div>

      <DoseResult result={result} produitLabel={PRODUIT_LABELS[produitActif]} />

      <button
        onClick={() => onConfirm(result)}
        style={{
          minHeight: 52,
          width: '100%',
          background: 'linear-gradient(135deg, var(--aqua) 0%, var(--aqua-deep) 100%)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 16,
          borderRadius: 'var(--radius-xl)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-cta)',
          animation: 'breathe 3s ease-in-out infinite',
        }}
      >
        J&apos;ai ajouté l&apos;{PRODUIT_LABELS[produitActif].toLowerCase()}
      </button>
    </div>
  )
}

const noteStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: 'var(--faint)',
  borderRadius: 'var(--radius-md)',
  borderLeft: '3px solid var(--aqua)',
}
