/**
 * ReglagesScreen — settings: custom targets, theme, language, account.
 * CSS variables only. Full dual-theme support.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'
import { useSettingsStore } from '@/store/settings.store'
import { useDosageStore, PRODUITS, PRODUIT_LABELS, PRODUIT_UNITS, DEFAULT_TARGETS } from '@/features/dosage/dosage.store'
import { triggerMorphTransition } from '@/hooks/useTheme'
import type { Produit } from '@/lib/chemistry'

export function ReglagesScreen() {
  const navigate = useNavigate()
  const isBrutale = useSettingsStore((s) => s.theme) === 'brutale'
  const { user, logout, deleteAccount, loading, error } = useAuthStore()
  const { theme, langue, setTheme, setLangue } = useSettingsStore()
  const { targets, setTarget, resetTarget } = useDosageStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const measurableProduits = PRODUITS.filter((p) => p !== 'algicide' && p !== 'stabilisant') as Produit[]

  async function handleDeleteAccount() {
    await deleteAccount()
    setConfirmDelete(false)
    navigate('/')
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700,
    letterSpacing: isBrutale ? '3px' : '0.1em',
    textTransform: 'uppercase',
    color: isBrutale ? 'var(--accent)' : 'var(--text-secondary)',
    marginBottom: 12, fontFamily: 'var(--font-ui)',
    borderBottom: isBrutale ? '1px solid var(--border-color)' : 'none',
    paddingBottom: isBrutale ? 8 : 0,
  }

  const rowCard: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px',
    background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'var(--bg)',
    borderRadius: isBrutale ? 0 : 'var(--radius-card)',
    boxShadow: isBrutale ? 'none' : 'var(--shadow-xs)',
    border: isBrutale ? '1px solid var(--border-color)' : 'none',
  }

  const btnSecondary: React.CSSProperties = {
    minHeight: 44, padding: '0 16px',
    border: `${isBrutale ? '2px' : '1.5px'} solid var(--border-color)`,
    borderRadius: isBrutale ? 0 : 'var(--radius-lg)',
    background: 'none', color: 'var(--text)',
    fontWeight: 600, fontSize: 14, cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    textTransform: isBrutale ? 'uppercase' : 'none',
    letterSpacing: isBrutale ? '1px' : 'normal',
  }

  const choiceBtn = (active: boolean): React.CSSProperties => ({
    flex: 1, minHeight: 44,
    borderRadius: isBrutale ? 0 : 'var(--radius-lg)',
    border: `${isBrutale ? '2px' : '2px'} solid ${active ? 'var(--accent)' : 'var(--border-color)'}`,
    background: active ? (isBrutale ? 'var(--accent)' : 'var(--faint)') : 'var(--bg)',
    color: active ? (isBrutale ? 'var(--ink, #0A0A0A)' : 'var(--accent)') : 'var(--text)',
    fontWeight: active ? 700 : 400,
    fontSize: 14, cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    textTransform: isBrutale ? 'uppercase' : 'none',
    letterSpacing: isBrutale ? '1px' : 'normal',
    boxShadow: active && isBrutale ? '4px 4px 0 var(--ink, #0A0A0A)' : 'none',
    transition: 'border-color 0.2s',
  })

  return (
    <div style={{
      padding: 'var(--page-h)',
      paddingTop: 'calc(var(--safe-top) + 8px)',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
      display: 'flex', flexDirection: 'column', gap: 0,
      background: 'var(--bg)', minHeight: '100dvh',
    }}>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 28, fontSize: isBrutale ? 36 : 24, fontWeight: 700, color: isBrutale ? 'var(--accent)' : 'var(--text)', textTransform: isBrutale ? 'uppercase' : 'none' }}>
        {isBrutale ? 'RÉGLAGES' : 'Réglages'}
      </h1>

      {/* ── Valeurs cibles ── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={sectionTitle}>Valeurs cibles</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {measurableProduits.map((p) => {
            const isModified = targets[p] !== DEFAULT_TARGETS[p]
            return (
              <div key={p} style={rowCard}>
                <span style={{ fontWeight: 600, fontSize: 14, flex: 1, color: 'var(--text)', fontFamily: 'var(--font-ui)' }}>
                  {PRODUIT_LABELS[p]}
                </span>
                <input
                  type="number"
                  value={targets[p]}
                  onChange={(e) => setTarget(p, parseFloat(e.target.value) || 0)}
                  step="any" min={0}
                  style={{
                    width: 72, minHeight: 36, padding: '0 8px',
                    borderRadius: isBrutale ? 0 : 'var(--radius-sm)',
                    border: `${isBrutale ? '2px' : '1.5px'} solid ${isModified ? 'var(--accent)' : 'var(--border-color)'}`,
                    fontSize: 14, fontWeight: 700, textAlign: 'right',
                    color: 'var(--text)', background: 'var(--bg)',
                    fontFamily: 'var(--font-ui)',
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 36, fontFamily: 'var(--font-ui)' }}>
                  {PRODUIT_UNITS[p]}
                </span>
                {isModified && (
                  <button onClick={() => resetTarget(p)} title="Réinitialiser" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 16, cursor: 'pointer', minHeight: 36, minWidth: 36, padding: 0 }}>
                    ↺
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Thème ── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={sectionTitle}>Thème</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['balnea', 'brutale'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                if (t !== theme) triggerMorphTransition(t, () => void setTheme(t))
              }}
              style={choiceBtn(theme === t)}
            >
              {t === 'balnea' ? 'Balnéa' : 'BRUTALE'}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, fontFamily: 'var(--font-ui)' }}>
          Appui long sur le logo pour la transition animée.
        </p>
      </section>

      {/* ── Langue ── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={sectionTitle}>Langue</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['fr', 'en'] as const).map((l) => (
            <button key={l} onClick={() => void setLangue(l)} style={choiceBtn(langue === l)}>
              {l === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      </section>

      {/* ── Compte ── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={sectionTitle}>Compte</h2>
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
              Connecté en tant que <strong style={{ color: 'var(--text)' }}>{user.email}</strong>
            </p>
            <button onClick={() => void logout()} style={btnSecondary}>
              {isBrutale ? 'DÉCONNECTER' : 'Se déconnecter'}
            </button>
            <button onClick={() => setConfirmDelete(true)} style={{ ...btnSecondary, color: isBrutale ? 'var(--red, #FF2D00)' : 'var(--peach, #FF7E5F)', borderColor: isBrutale ? 'var(--red, #FF2D00)' : 'var(--peach, #FF7E5F)' }}>
              {isBrutale ? 'SUPPRIMER MON COMPTE' : 'Supprimer mon compte'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/auth/register" style={{ ...btnSecondary, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              {isBrutale ? 'CRÉER UN COMPTE' : 'Créer un compte'}
            </Link>
            <Link to="/auth/login" style={{ ...btnSecondary, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              {isBrutale ? 'SE CONNECTER' : 'Se connecter'}
            </Link>
          </div>
        )}
      </section>

      <hr style={{ border: 'none', borderTop: isBrutale ? '2px solid var(--border-color)' : '1px solid var(--border-color)', marginBottom: 20 }} />

      <Link to="/privacy" style={{ display: 'flex', alignItems: 'center', minHeight: 44, color: 'var(--text)', fontSize: 15, fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-ui)', textTransform: isBrutale ? 'uppercase' : 'none', letterSpacing: isBrutale ? '0.5px' : 'normal' }}>
        {isBrutale ? 'POLITIQUE DE CONFIDENTIALITÉ' : 'Politique de confidentialité'}
        <span aria-hidden="true" style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>→</span>
      </Link>

      {error && <p role="alert" style={{ color: isBrutale ? 'var(--red, #FF2D00)' : 'var(--peach, #FF7E5F)', fontSize: 14, marginTop: 12, fontFamily: 'var(--font-ui)' }}>{error}</p>}

      {/* Delete modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--page-h)', zIndex: 200 }}>
          <div style={{ background: 'var(--bg)', borderRadius: isBrutale ? 0 : 'var(--radius-2xl)', padding: 24, width: '100%', maxWidth: 400, boxShadow: isBrutale ? 'none' : 'var(--shadow-xl)', border: isBrutale ? '2px solid var(--red, #FF2D00)' : 'none' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 12, color: isBrutale ? 'var(--red, #FF2D00)' : 'var(--text)', textTransform: isBrutale ? 'uppercase' : 'none', fontSize: isBrutale ? 24 : 20 }}>
              {isBrutale ? 'SUPPRIMER ?' : 'Supprimer votre compte ?'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, lineHeight: 1.6, fontFamily: 'var(--font-ui)' }}>
              Toutes vos données (piscines, sessions) seront supprimées définitivement. Cette action est <strong>irréversible</strong>.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => void handleDeleteAccount()} disabled={loading} style={{ flex: 1, minHeight: 52, background: isBrutale ? 'var(--red, #FF2D00)' : 'var(--peach, #FF7E5F)', color: '#fff', borderRadius: isBrutale ? 0 : 'var(--radius-xl)', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-ui)', textTransform: isBrutale ? 'uppercase' : 'none' }}>
                {loading ? 'Suppression…' : (isBrutale ? 'SUPPRIMER' : 'Supprimer définitivement')}
              </button>
              <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, minHeight: 52, background: 'var(--faint)', color: 'var(--text)', borderRadius: isBrutale ? 0 : 'var(--radius-xl)', border: isBrutale ? '1px solid var(--border-color)' : 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
                {isBrutale ? 'ANNULER' : 'Annuler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
