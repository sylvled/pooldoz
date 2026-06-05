import { useMemo } from 'react'
import { PebbleGauge } from '@/components/PebbleGauge'
import { DoseResult } from './DoseResult'
import { useDosageStore, PRODUIT_LABELS, PRODUIT_UNITS } from './dosage.store'
import { calculateDose } from '@/lib/chemistry'
import type { Produit } from '@/lib/chemistry'
import { usePiscineStore } from '@/features/piscine/piscine.store'

export function MeasurePanel({ onConfirm }: { onConfirm: (dose: ReturnType<typeof calculateDose>) => void }) {
  const { produitActif, tauxMesure, setTauxMesure, targets } = useDosageStore()
  const { piscines, activePiscineId } = usePiscineStore()
  const activePiscine = piscines.find((p) => p.id === activePiscineId)
  const volumeM3 = activePiscine?.volume ?? 50

  const taux = parseFloat(tauxMesure)
  const target = targets[produitActif]

  const result = useMemo(() => {
    if (!tauxMesure || isNaN(taux)) return null
    return calculateDose({
      produit: produitActif as Produit,
      tauxMesure: taux,
      tauxCible: target,
      volumeM3,
    })
  }, [produitActif, taux, target, volumeM3, tauxMesure])

  const canConfirm = result !== null && tauxMesure !== ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 var(--page-h)' }}>
      {/* Score gauge — shown prominently BEFORE dose result */}
      {result && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6 }}>
            Niveau actuel
          </p>
          <PebbleGauge value={taux} target={target} status={result.status} />
        </div>
      )}

      {/* Measure input */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
          Taux mesuré
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="number"
            inputMode="decimal"
            value={tauxMesure}
            onChange={(e) => setTauxMesure(e.target.value)}
            placeholder={String(target)}
            style={inputStyle}
            min={0}
            step="any"
          />
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: 15, minWidth: 40 }}>
            {PRODUIT_UNITS[produitActif]}
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          Cible : {target} {PRODUIT_UNITS[produitActif]}
        </p>
      </div>

      {/* Dose result */}
      <DoseResult result={result} produitLabel={PRODUIT_LABELS[produitActif]} />

      {/* CTA */}
      <button
        disabled={!canConfirm}
        onClick={() => result && onConfirm(result)}
        style={{
          minHeight: 52,
          width: '100%',
          background: canConfirm
            ? 'linear-gradient(135deg, var(--aqua) 0%, var(--aqua-deep) 100%)'
            : 'var(--faint)',
          color: canConfirm ? '#fff' : 'var(--text-secondary)',
          fontWeight: 700,
          fontSize: 16,
          borderRadius: 'var(--radius-xl)',
          border: 'none',
          cursor: canConfirm ? 'pointer' : 'default',
          opacity: canConfirm ? 1 : 0.4,
          boxShadow: canConfirm ? 'var(--shadow-cta)' : 'none',
          animation: canConfirm ? 'breathe 3s ease-in-out infinite' : 'none',
          transition: 'opacity 0.2s, background 0.2s',
        }}
      >
        J&apos;ai ajouté le {PRODUIT_LABELS[produitActif].toLowerCase()}
      </button>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 52,
  padding: '0 16px',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--border-color)',
  fontSize: 20,
  fontWeight: 700,
  color: 'var(--text)',
  background: 'var(--bg)',
  fontFamily: 'var(--font-ui)',
}
