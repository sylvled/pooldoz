/**
 * LoginScreen — email + password login.
 * CSS variables only. Dual-theme support.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from './auth.store'
import { useSettingsStore } from '@/store/settings.store'

export function LoginScreen() {
  const navigate = useNavigate()
  const isBrutale = useSettingsStore((s) => s.theme) === 'brutale'
  const { login, loading, error, clearError } = useAuthStore()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  function validate(): boolean {
    if (!email.includes('@')) { setValidationError('Adresse email invalide.'); return false }
    setValidationError(null); return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    clearError()
    await login(email, password)
    if (!useAuthStore.getState().error) navigate('/')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 'var(--page-h)', paddingTop: 'var(--safe-top)', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 420, background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'var(--bg)', borderRadius: isBrutale ? 0 : 'var(--radius-2xl)', padding: '32px 28px', boxShadow: isBrutale ? 'none' : 'var(--shadow-xl)', textAlign: 'center', border: isBrutale ? '2px solid var(--border-color)' : 'none' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: isBrutale ? 'normal' : 'italic', marginBottom: 8, fontSize: isBrutale ? 36 : 24, fontWeight: 700, color: isBrutale ? 'var(--accent)' : 'var(--text)', textTransform: isBrutale ? 'uppercase' : 'none' }}>
          {isBrutale ? 'CONNEXION' : 'Connexion'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, fontFamily: 'var(--font-ui)' }}>
          Retrouvez vos piscines sur cet appareil.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['Email', 'Mot de passe'].map((lbl, i) => (
              <div key={lbl}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: isBrutale ? '3px' : '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6, textAlign: 'left', fontFamily: 'var(--font-ui)' }}>
                  {lbl}
                </label>
                <input
                  type={i === 0 ? 'email' : 'password'}
                  value={i === 0 ? email : password}
                  onChange={(e) => i === 0 ? setEmail(e.target.value) : setPassword(e.target.value)}
                  autoComplete={i === 0 ? 'email' : 'current-password'}
                  placeholder={i === 0 ? 'vous@exemple.fr' : '••••••••'}
                  required
                  style={{ display: 'block', width: '100%', minHeight: 48, padding: '0 16px', borderRadius: isBrutale ? 0 : 'var(--radius-md)', border: `${isBrutale ? '2px' : '1.5px'} solid var(--border-color)`, fontSize: 16, color: 'var(--text)', background: 'var(--bg)', fontFamily: 'var(--font-ui)' }}
                />
              </div>
            ))}

            {(validationError ?? error) && (
              <p role="alert" style={{ color: isBrutale ? 'var(--red, #FF2D00)' : 'var(--peach, #FF7E5F)', fontSize: 14, fontFamily: 'var(--font-ui)' }}>
                {validationError ?? error}
              </p>
            )}

            <button type="submit" disabled={loading} style={{ display: 'block', width: '100%', minHeight: 52, background: isBrutale ? 'var(--accent)' : 'linear-gradient(135deg, var(--aqua, #3DB8B8) 0%, var(--aqua-deep, #2A9090) 100%)', color: isBrutale ? 'var(--ink, #0A0A0A)' : '#fff', fontWeight: 700, fontSize: 16, borderRadius: isBrutale ? 0 : 'var(--radius-xl)', border: 'none', cursor: 'pointer', boxShadow: isBrutale ? '4px 4px 0 var(--ink, #0A0A0A)' : 'var(--shadow-cta)', fontFamily: 'var(--font-ui)', textTransform: isBrutale ? 'uppercase' : 'none', letterSpacing: isBrutale ? '1px' : 'normal', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Connexion…' : (isBrutale ? 'SE CONNECTER' : 'Se connecter')}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
          Pas encore de compte ?{' '}
          <Link to="/auth/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            {isBrutale ? 'CRÉER UN COMPTE' : 'Créer un compte'}
          </Link>
        </p>
      </div>
    </div>
  )
}
