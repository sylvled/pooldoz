/**
 * PiscineScreen — pool profile management.
 *
 * Balnéa: cream cards, gradient CTA, soft shadows.
 * Brutale: dark cards, acid borders, geometric CTA.
 *
 * CSS variables only.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { usePiscineStore } from './piscine.store'
import { useSettingsStore } from '@/store/settings.store'

function useIsBrutale() {
  return useSettingsStore((s) => s.theme) === 'brutale'
}

export function PiscineScreen() {
  const navigate = useNavigate()
  const isBrutale = useIsBrutale()
  const piscines = useLiveQuery(() => db.piscines.orderBy('updatedAt').reverse().toArray(), [])
  const { setActivePiscine, deletePiscine } = usePiscineStore()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newNom, setNewNom] = useState('')

  useEffect(() => {
    if (piscines && piscines.length === 1) setActivePiscine(piscines[0].id)
  }, [piscines, setActivePiscine])

  async function handleCreate() {
    if (!newNom.trim()) return
    const { createPiscine, setActivePiscine: setActive } = usePiscineStore.getState()
    const id = await createPiscine(newNom.trim())
    setActive(id)
    setCreating(false)
    setNewNom('')
    navigate('/onboarding')
  }

  async function handleDelete(id: string) {
    await deletePiscine(id)
    setConfirmDeleteId(null)
  }

  if (!piscines) return null

  const ctaPrimary: React.CSSProperties = {
    display: 'block', width: '100%', minHeight: 52, padding: '0 24px',
    background: isBrutale ? 'var(--accent)' : 'linear-gradient(135deg, var(--aqua, #3DB8B8) 0%, var(--aqua-deep, #2A9090) 100%)',
    color: isBrutale ? 'var(--ink, #0A0A0A)' : '#fff',
    fontWeight: 700, fontSize: 16,
    borderRadius: isBrutale ? 0 : 'var(--radius-xl)',
    border: isBrutale ? '2px solid var(--accent)' : 'none',
    boxShadow: isBrutale ? '4px 4px 0 var(--ink, #0A0A0A)' : 'var(--shadow-cta)',
    animation: !isBrutale ? 'breathe 3s ease-in-out infinite' : 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    textTransform: isBrutale ? 'uppercase' : 'none',
    letterSpacing: isBrutale ? '1px' : 'normal',
  }

  const ctaSecondary: React.CSSProperties = {
    minHeight: 44, padding: '0 20px',
    background: 'var(--faint)', color: 'var(--text)',
    fontWeight: 600, fontSize: 14,
    borderRadius: isBrutale ? 0 : 'var(--radius-lg)',
    border: isBrutale ? '1px solid var(--border-color)' : 'none',
    cursor: 'pointer', fontFamily: 'var(--font-ui)',
  }

  if (piscines.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80dvh', padding: 'var(--page-h)', textAlign: 'center', background: 'var(--bg)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: isBrutale ? 'normal' : 'italic', fontSize: isBrutale ? 48 : 28, textTransform: isBrutale ? 'uppercase' : 'none', color: isBrutale ? 'var(--accent)' : 'var(--text)' }}>
          {isBrutale ? 'PISCINE' : 'Ma piscine'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, marginBottom: 32, fontFamily: 'var(--font-ui)' }}>
          Vous n'avez pas encore configuré de piscine.
        </p>
        <button style={ctaPrimary} onClick={() => setCreating(true)}>
          {isBrutale ? 'CONFIGURER' : 'Configurer ma piscine'}
        </button>
        {creating && <CreateModal nom={newNom} setNom={setNewNom} onCreate={handleCreate} onCancel={() => setCreating(false)} isBrutale={isBrutale} />}
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--page-h)', paddingTop: 'calc(var(--safe-top) + 8px)', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))', background: 'var(--bg)', minHeight: '100dvh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isBrutale ? 36 : 24, fontWeight: 700, textTransform: isBrutale ? 'uppercase' : 'none', color: isBrutale ? 'var(--accent)' : 'var(--text)' }}>
          {isBrutale ? 'MES PISCINES' : 'Mes piscines'}
        </h1>
        <button style={{ ...ctaSecondary, display: 'flex', alignItems: 'center' }} onClick={() => setCreating(true)}>
          + Ajouter
        </button>
      </header>

      <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {piscines.map((p) => (
          <li key={p.id} style={{
            display: 'flex', alignItems: 'stretch',
            background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'var(--bg)',
            borderRadius: isBrutale ? 0 : 'var(--radius-card)',
            boxShadow: isBrutale ? 'none' : 'var(--shadow-sm)',
            border: isBrutale ? '1px solid var(--border-color)' : 'none',
            overflow: 'hidden',
          }}>
            <button
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', minHeight: 72, fontFamily: 'var(--font-ui)' }}
              onClick={() => { setActivePiscine(p.id); navigate('/onboarding') }}
            >
              <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>{p.nom}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>
                {p.volume != null ? `${p.volume.toFixed(2)} m³` : 'Volume non calculé'}
              </span>
            </button>
            <button
              style={{ padding: '0 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: isBrutale ? 'var(--red, #FF2D00)' : 'var(--peach, #FF7E5F)', minHeight: 44, minWidth: 44 }}
              onClick={() => setConfirmDeleteId(p.id)}
              aria-label={`Supprimer ${p.nom}`}
            >
              🗑
            </button>
          </li>
        ))}
      </ul>

      {creating && <CreateModal nom={newNom} setNom={setNewNom} onCreate={handleCreate} onCancel={() => setCreating(false)} isBrutale={isBrutale} />}

      {confirmDeleteId && (
        <ConfirmDelete
          piscineNom={piscines.find((p) => p.id === confirmDeleteId)?.nom ?? ''}
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
          isBrutale={isBrutale}
        />
      )}
    </div>
  )
}

function CreateModal({ nom, setNom, onCreate, onCancel, isBrutale }: {
  nom: string; setNom: (s: string) => void; onCreate: () => void; onCancel: () => void; isBrutale: boolean
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--page-h)', zIndex: 200 }}>
      <div style={{ background: 'var(--bg)', borderRadius: isBrutale ? 0 : 'var(--radius-2xl)', padding: 24, width: '100%', maxWidth: 400, boxShadow: isBrutale ? 'none' : 'var(--shadow-xl)', border: isBrutale ? '2px solid var(--accent)' : 'none' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 16, color: isBrutale ? 'var(--accent)' : 'var(--text)', textTransform: isBrutale ? 'uppercase' : 'none', fontSize: isBrutale ? 28 : 20 }}>
          {isBrutale ? 'NOUVELLE PISCINE' : 'Nouvelle piscine'}
        </h2>
        <input
          style={{ display: 'block', width: '100%', padding: '12px 16px', borderRadius: isBrutale ? 0 : 'var(--radius-md)', border: `${isBrutale ? '2px' : '1.5px'} solid var(--border-color)`, fontSize: 16, color: 'var(--text)', background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'var(--bg)', fontFamily: 'var(--font-ui)', minHeight: 48 }}
          placeholder="Nom de la piscine"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onCreate()}
          autoFocus
          maxLength={50}
        />
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button onClick={onCreate} disabled={!nom.trim()} style={{ flex: 1, minHeight: 52, background: isBrutale ? 'var(--accent)' : 'linear-gradient(135deg, var(--aqua, #3DB8B8) 0%, var(--aqua-deep, #2A9090) 100%)', color: isBrutale ? 'var(--ink, #0A0A0A)' : '#fff', fontWeight: 700, fontSize: 15, borderRadius: isBrutale ? 0 : 'var(--radius-xl)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', opacity: nom.trim() ? 1 : 0.5 }}>
            {isBrutale ? 'CRÉER' : 'Créer'}
          </button>
          <button onClick={onCancel} style={{ flex: 1, minHeight: 44, background: 'var(--faint)', color: 'var(--text)', fontWeight: 600, fontSize: 14, borderRadius: isBrutale ? 0 : 'var(--radius-lg)', border: isBrutale ? '1px solid var(--border-color)' : 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
            {isBrutale ? 'ANNULER' : 'Annuler'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfirmDelete({ piscineNom, onConfirm, onCancel, isBrutale }: {
  piscineNom: string; onConfirm: () => void; onCancel: () => void; isBrutale: boolean
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--page-h)', zIndex: 200 }}>
      <div style={{ background: 'var(--bg)', borderRadius: isBrutale ? 0 : 'var(--radius-2xl)', padding: 24, width: '100%', maxWidth: 400, boxShadow: isBrutale ? 'none' : 'var(--shadow-xl)', border: isBrutale ? '2px solid var(--red, #FF2D00)' : 'none' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 12, color: isBrutale ? 'var(--red, #FF2D00)' : 'var(--text)', textTransform: isBrutale ? 'uppercase' : 'none', fontSize: isBrutale ? 24 : 20 }}>
          {isBrutale ? 'SUPPRIMER ?' : 'Supprimer la piscine ?'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontFamily: 'var(--font-ui)' }}>
          <strong style={{ color: 'var(--text)' }}>{piscineNom}</strong> sera supprimée définitivement. Cette action est irréversible.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onConfirm} style={{ flex: 1, minHeight: 52, background: isBrutale ? 'var(--red, #FF2D00)' : 'var(--peach, #FF7E5F)', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: isBrutale ? 0 : 'var(--radius-xl)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', textTransform: isBrutale ? 'uppercase' : 'none' }}>
            {isBrutale ? 'SUPPRIMER' : 'Supprimer'}
          </button>
          <button onClick={onCancel} style={{ flex: 1, minHeight: 44, background: 'var(--faint)', color: 'var(--text)', fontWeight: 600, fontSize: 14, borderRadius: isBrutale ? 0 : 'var(--radius-lg)', border: isBrutale ? '1px solid var(--border-color)' : 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
            {isBrutale ? 'ANNULER' : 'Annuler'}
          </button>
        </div>
      </div>
    </div>
  )
}
