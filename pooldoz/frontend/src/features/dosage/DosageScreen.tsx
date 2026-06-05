/**
 * DosageScreen — main product dosage screen.
 *
 * Balnéa: violet header with blobs, cream bg, gradient CTA.
 * Brutale: black bg, acid accents, geometric CTA, no gradients.
 *
 * CSS variables only.
 */
import { useState, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useDosageStore, PREVENTIVE, PRODUIT_LABELS, PRODUIT_UNITS, DEFAULT_TARGETS } from './dosage.store'
import { usePiscineStore } from '@/features/piscine/piscine.store'
import { useSettingsStore } from '@/store/settings.store'
import { AppHeader } from '@/components/AppHeader'
import { ProductWheel } from './ProductWheel'
import { SeasonBanner } from '@/components/SeasonBanner'
import { shouldShowSeasonBanner } from '@/lib/reminders'
import { calculateDose } from '@/lib/chemistry'
import type { Produit, DoseResult } from '@/lib/chemistry'

const CHECKMARK_MS = 300

// ── PebbleGauge (inline — matches dosage-wheel-balnea.html) ──────────────────
function PebbleGauge({ value, target }: { value: number; target: number }) {
  const isBrutale = useSettingsStore((s) => s.theme) === 'brutale'
  const ratio   = target > 0 ? Math.min(Math.max(value / target, 0), 1.5) : 0
  const total   = 11
  const fillCount  = Math.round((ratio / 1.5) * total)
  const markerPos  = Math.round((1 / 1.5) * total) // target marker at 67%

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 5 }}>
        {Array.from({ length: total }, (_, i) => {
          if (i === markerPos) {
            return (
              <div key={i} style={{
                flex: '0 0 3px', height: 14,
                background: 'var(--accent)',
                borderRadius: isBrutale ? 0 : 2,
              }} />
            )
          }
          const isFill = i < fillCount
          let bg = 'var(--faint)'
          if (isFill) {
            bg = ratio < 0.9 ? 'var(--peach, #FF7E5F)'
               : ratio < 1.05 ? 'var(--accent)'
               : 'var(--accent-deep)'
          }
          if (isBrutale && isFill) {
            bg = ratio < 0.9 ? 'var(--red, #FF2D00)' : 'var(--accent)'
          }
          return (
            <div key={i} style={{
              flex: 1, height: isBrutale ? 10 : 8,
              borderRadius: isBrutale ? 0 : 4,
              background: isFill ? bg : 'var(--faint)',
              border: isBrutale && isFill ? '1px solid var(--accent)' : 'none',
            }} />
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'var(--font-ui)' }}>
        <span>0</span>
        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>↑ cible {target.toLocaleString('fr-FR')}</span>
        <span>{(target * 1.5).toLocaleString('fr-FR')}</span>
      </div>
    </div>
  )
}

// ── MeasurePanel ──────────────────────────────────────────────────────────────
function MeasurePanel({ onConfirm, volumeM3 }: { onConfirm: (r: DoseResult) => void; volumeM3: number }) {
  const { produitActif, tauxMesure, setTauxMesure, targets } = useDosageStore()
  const isBrutale = useSettingsStore((s) => s.theme) === 'brutale'
  const taux   = parseFloat(tauxMesure)
  const target = targets[produitActif]
  const isPreventive = PREVENTIVE.has(produitActif)

  let result: DoseResult | null = null
  if (!isPreventive && tauxMesure && !isNaN(taux)) {
    result = calculateDose({ produit: produitActif as Produit, tauxMesure: taux, tauxCible: target, volumeM3 })
  } else if (isPreventive) {
    result = calculateDose({ produit: produitActif as Produit, tauxMesure: 0, tauxCible: 0, volumeM3 })
  }
  const canConfirm = result !== null

  return (
    <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Drag handle */}
      {!isBrutale && (
        <div style={{ width: 36, height: 3, background: 'rgba(61,184,184,0.3)', borderRadius: 2, margin: '0 auto' }} />
      )}
      {isBrutale && (
        <div style={{ width: '100%', height: 3, background: 'var(--accent)', marginBottom: 4 }} />
      )}

      {/* Measure card */}
      {!isPreventive ? (
        <div style={{
          background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'white',
          borderRadius: 'var(--radius-card)',
          padding: 18,
          boxShadow: 'var(--shadow-sm)',
          position: 'relative', overflow: 'hidden',
          border: isBrutale ? '1px solid var(--border-color)' : 'none',
        }}>
          {!isBrutale && (
            <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', top: -30, right: -20, background: 'radial-gradient(circle, rgba(61,184,184,0.12), transparent 70%)', pointerEvents: 'none' }} />
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
              {PRODUIT_LABELS[produitActif]} mesuré
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
              Cible <strong style={{ color: 'var(--text)' }}>{target.toLocaleString('fr-FR')} {PRODUIT_UNITS[produitActif]}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <input
              type="number" inputMode="decimal"
              value={tauxMesure}
              onChange={(e) => setTauxMesure(e.target.value)}
              placeholder={String(target)}
              style={{
                flex: 1,
                background: 'var(--faint)',
                border: `2px solid ${isBrutale ? 'var(--border-color)' : 'rgba(61,184,184,0.2)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                fontFamily: 'var(--font-display)',
                fontSize: 28, fontWeight: 700,
                color: 'var(--text)',
                textAlign: 'center',
                outline: 'none',
                minHeight: 0,
                minWidth: 0,
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = isBrutale ? 'var(--border-color)' : 'rgba(61,184,184,0.2)'}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', minWidth: 32, fontFamily: 'var(--font-ui)' }}>
              {PRODUIT_UNITS[produitActif]}
            </span>
          </div>

          {tauxMesure && !isNaN(taux) && (
            <PebbleGauge value={taux} target={target} />
          )}
        </div>
      ) : (
        <div style={{
          background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'var(--faint)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          borderLeft: `3px solid var(--accent)`,
          border: isBrutale ? '1px solid var(--border-color)' : undefined,
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontFamily: 'var(--font-ui)' }}>
            Dose préventive calculée sur {volumeM3.toFixed(1)} m³. Aucune mesure requise.
          </p>
        </div>
      )}

      {/* Result chip */}
      {result && (
        <div style={{
          background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'linear-gradient(135deg, var(--violet) 0%, var(--violet-mid) 100%)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          border: isBrutale ? '2px solid var(--accent)' : 'none',
          boxShadow: isBrutale ? '4px 4px 0 var(--accent)' : 'none',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontStyle: isBrutale ? 'normal' : 'italic',
            fontWeight: 700,
            fontSize: isBrutale ? 36 : 32,
            color: 'var(--accent)',
            lineHeight: 1,
            letterSpacing: isBrutale ? '-1px' : '-0.5px',
            flexShrink: 0,
            textTransform: isBrutale ? 'uppercase' : 'none',
          }}>
            {result.dose != null ? `${result.dose.toFixed(1)} ${result.unit}` : '—'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: isBrutale ? 'var(--text-secondary)' : 'rgba(255,255,255,0.5)', marginBottom: 2, fontFamily: 'var(--font-ui)' }}>
              {result.optimal ? 'Eau équilibrée' : 'À ajouter · ' + PRODUIT_LABELS[produitActif]}
            </div>
            <div style={{ fontSize: 12, color: isBrutale ? 'var(--text)' : 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-ui)' }}>
              {result.optimal ? 'Aucun ajout nécessaire' : result.conditionnements.join(' + ')}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        disabled={!canConfirm}
        onClick={() => result && onConfirm(result)}
        style={{
          width: '100%', border: 'none',
          borderRadius: isBrutale ? 0 : 'var(--radius-md)',
          padding: '15px 20px',
          fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700,
          cursor: canConfirm ? 'pointer' : 'default',
          background: canConfirm
            ? (isBrutale ? 'var(--accent)' : 'linear-gradient(135deg, var(--aqua, #3DB8B8) 0%, var(--aqua-deep, #2A9090) 100%)')
            : 'var(--faint)',
          color: canConfirm
            ? (isBrutale ? 'var(--ink, #0A0A0A)' : '#fff')
            : 'var(--text-secondary)',
          boxShadow: canConfirm
            ? (isBrutale ? '4px 4px 0 var(--ink, #0A0A0A)' : 'var(--shadow-cta)')
            : 'none',
          animation: canConfirm && !isBrutale ? 'breathe 3s ease-in-out infinite' : 'none',
          opacity: canConfirm ? 1 : 0.5,
          textTransform: isBrutale ? 'uppercase' : 'none',
          letterSpacing: isBrutale ? '1px' : 'normal',
          transition: 'opacity 0.2s',
          minHeight: 52,
        }}
      >
        ✓ J&apos;ai ajouté le {PRODUIT_LABELS[produitActif].toLowerCase()}
      </button>
    </div>
  )
}

// ── DosageScreen ──────────────────────────────────────────────────────────────
export function DosageScreen() {
  const { produitActif, tauxMesure, resetMesure } = useDosageStore()
  const { piscines, activePiscineId, setActivePiscine } = usePiscineStore()
  const isBrutale = useSettingsStore((s) => s.theme) === 'brutale'
  const activePiscine = piscines.find((p) => p.id === activePiscineId)
  const volumeM3 = activePiscine?.volume ?? 50

  const [showCheck, setShowCheck]         = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [sheetOpen, setSheetOpen]         = useState(false)

  const sessions = useLiveQuery(() => db.sessions.orderBy('createdAt').reverse().toArray(), [])
  const lastSession = sessions?.[0]
  const showBanner = !bannerDismissed && shouldShowSeasonBanner(lastSession?.createdAt ?? null, null)

  // Suggestion: product most off-target
  const suggestedIndex = (() => {
    if (!sessions || sessions.length === 0) return undefined
    let maxRatio = 0; let best: number | undefined
    const keys = Object.keys(DEFAULT_TARGETS) as Produit[]
    keys.forEach((p, i) => {
      const last = sessions.find((s) => s.produit === p)
      if (last?.tauxMesure != null && DEFAULT_TARGETS[p] > 0) {
        const ratio = Math.abs((last.tauxMesure - DEFAULT_TARGETS[p]) / DEFAULT_TARGETS[p])
        if (ratio > maxRatio) { maxRatio = ratio; best = i }
      }
    })
    return best
  })()

  const handleConfirm = useCallback(async (result: DoseResult) => {
    if (!activePiscineId) return
    await db.sessions.add({
      id: crypto.randomUUID(),
      piscineId: activePiscineId,
      produit: produitActif,
      tauxMesure: tauxMesure ? parseFloat(tauxMesure) : null,
      dose: result.dose,
      valide: true,
      createdAt: Date.now(),
    })
    setShowCheck(true)
    setTimeout(() => { setShowCheck(false); resetMesure() }, CHECKMARK_MS + 100)
  }, [activePiscineId, produitActif, tauxMesure, resetMesure])

  const poolPill = activePiscine
    ? `${activePiscine.nom} · ${activePiscine.volume != null ? `${activePiscine.volume.toFixed(1)} m³` : '—'}`
    : piscines.length > 0 ? 'Mes piscines' : null

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100dvh',
      background: 'var(--bg)',
      paddingBottom: 'calc(60px + env(safe-area-inset-bottom))',
    }}>

      <AppHeader
        poolPill={poolPill}
        onPoolPillClick={piscines.length > 1 ? () => setSheetOpen(true) : undefined}
      >
        <div style={{ color: isBrutale ? 'var(--text-secondary)' : 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 400, marginBottom: 4, fontFamily: 'var(--font-ui)' }}>
          Bonjour
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: isBrutale ? 42 : 26,
          fontWeight: 700,
          color: isBrutale ? 'var(--accent)' : '#fff',
          lineHeight: 1.1,
          textTransform: isBrutale ? 'uppercase' : 'none',
          letterSpacing: isBrutale ? '-1px' : 'normal',
        }}>
          {isBrutale ? 'DOSAGE' : <>Que voulez-vous<br /><em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>vérifier aujourd&apos;hui ?</em></>}
        </div>
      </AppHeader>

      {/* Season banner */}
      {showBanner && (
        <div style={{ margin: '0 20px', marginTop: 16 }}>
          <SeasonBanner onDismiss={() => setBannerDismissed(true)} />
        </div>
      )}

      {/* Suggestion banner */}
      {suggestedIndex !== undefined && (
        <div style={{
          background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'rgba(61,184,184,0.08)',
          borderBottom: isBrutale ? '1px solid var(--accent)' : '1px solid rgba(61,184,184,0.15)',
          padding: '9px 20px',
          display: 'flex', alignItems: 'center', gap: 8,
          marginTop: showBanner ? 8 : 0,
        }}>
          <div style={{
            width: 20, height: 20,
            background: isBrutale ? 'var(--accent)' : 'rgba(61,184,184,0.15)',
            borderRadius: isBrutale ? 0 : 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: isBrutale ? 'var(--ink, #0A0A0A)' : 'inherit', flexShrink: 0,
          }}>✦</div>
          <div>
            <div style={{ fontSize: 12, color: isBrutale ? 'var(--accent)' : 'var(--accent-deep, #2A9090)', fontWeight: 600, fontFamily: 'var(--font-ui)' }}>
              {PRODUIT_LABELS[Object.keys(DEFAULT_TARGETS)[suggestedIndex] as Produit]} suggéré
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
              Taux bas depuis votre dernière mesure
            </div>
          </div>
        </div>
      )}

      {/* Wheel */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        padding: '20px 0 8px',
        background: isBrutale ? 'var(--bg)' : 'var(--surface, #EDE3F8)',
      }}>
        <ProductWheel suggestedIndex={suggestedIndex} />
      </div>

      {/* Measure panel */}
      <div style={{
        background: 'var(--bg)',
        borderRadius: isBrutale ? 0 : 'var(--radius-2xl) var(--radius-2xl) 0 0',
        borderTop: isBrutale ? '3px solid var(--accent)' : 'none',
        paddingTop: 16, flex: 1,
      }}>
        <MeasurePanel onConfirm={handleConfirm} volumeM3={volumeM3} />
      </div>

      {/* Multi-pool bottom sheet */}
      {piscines.length > 1 && sheetOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setSheetOpen(false)}>
          <div
            style={{ width: '100%', background: 'var(--bg)', borderRadius: isBrutale ? 0 : 'var(--radius-sheet) var(--radius-sheet) 0 0', padding: '20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))', border: isBrutale ? '2px solid var(--accent)' : 'none' }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Choisir une piscine</h3>
            {piscines.map((p) => (
              <button key={p.id}
                onClick={() => { setActivePiscine(p.id); setSheetOpen(false) }}
                style={{ display: 'flex', width: '100%', padding: '14px 0', borderBottom: '1px solid var(--border-color)', background: 'none', border: 'none', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'var(--border-color)', cursor: 'pointer', textAlign: 'left', gap: 8, fontWeight: p.id === activePiscineId ? 700 : 400, color: p.id === activePiscineId ? 'var(--accent)' : 'var(--text)', fontSize: 16, fontFamily: 'var(--font-ui)', minHeight: 52 }}>
                {p.id === activePiscineId && '✓ '}{p.nom}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Checkmark overlay */}
      {showCheck && (
        <div aria-live="polite" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, pointerEvents: 'none' }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: isBrutale ? 0 : '50%',
            background: 'var(--accent)',
            border: isBrutale ? '3px solid var(--ink, #0A0A0A)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, color: isBrutale ? 'var(--ink, #0A0A0A)' : '#fff',
            animation: `checkmark-pulse ${CHECKMARK_MS}ms ease-out forwards`,
          }}>✓</div>
        </div>
      )}
    </div>
  )
}
