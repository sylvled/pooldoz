import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from './auth.store'
import { useSettingsStore } from '@/store/settings.store'

export function RegisterScreen() {
  const navigate = useNavigate()
  const isBrutale = useSettingsStore((s) => s.theme) === 'brutale'
  const { register, loading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  function validate(): boolean {
    if (!email.includes('@')) {
      setValidationError('Adresse email invalide.')
      return false
    }
    if (password.length < 8) {
      setValidationError('Le mot de passe doit comporter au moins 8 caractères.')
      return false
    }
    setValidationError(null)
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    clearError()
    await register(email, password)
    if (!useAuthStore.getState().error) setSent(true)
  }

  const cardStyle: React.CSSProperties = { width: '100%', maxWidth: 420, background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'var(--bg)', borderRadius: isBrutale ? 0 : 'var(--radius-2xl)', padding: '32px 28px', boxShadow: isBrutale ? 'none' : 'var(--shadow-xl)', textAlign: 'center', border: isBrutale ? '2px solid var(--border-color)' : 'none' }
  const inputStyle: React.CSSProperties = { display: 'block', width: '100%', minHeight: 48, padding: '0 16px', borderRadius: isBrutale ? 0 : 'var(--radius-md)', border: `${isBrutale ? '2px' : '1.5px'} solid var(--border-color)`, fontSize: 16, color: 'var(--text)', background: 'var(--bg)', fontFamily: 'var(--font-ui)' }
  const ctaStyle: React.CSSProperties = { display: 'block', width: '100%', minHeight: 52, background: isBrutale ? 'var(--accent)' : 'linear-gradient(135deg, var(--aqua, #3DB8B8) 0%, var(--aqua-deep, #2A9090) 100%)', color: isBrutale ? 'var(--ink, #0A0A0A)' : '#fff', fontWeight: 700, fontSize: 16, borderRadius: isBrutale ? 0 : 'var(--radius-xl)', border: 'none', cursor: 'pointer', boxShadow: isBrutale ? '4px 4px 0 var(--ink, #0A0A0A)' : 'var(--shadow-cta)', fontFamily: 'var(--font-ui)', textTransform: isBrutale ? 'uppercase' : 'none', letterSpacing: isBrutale ? '1px' : 'normal' }

  if (sent) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 'var(--page-h)', paddingTop: 'var(--safe-top)', background: 'var(--bg)' }}>
        <div style={cardStyle}>
          <span style={{ fontSize: 48 }}>📧</span>
          <h2 style={{ fontFamily: 'var(--font-display)', marginTop: 16, color: isBrutale ? 'var(--accent)' : 'var(--text)', textTransform: isBrutale ? 'uppercase' : 'none' }}>
            {isBrutale ? 'VÉRIFIEZ VOTRE EMAIL' : 'Vérifiez votre email'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6, fontFamily: 'var(--font-ui)' }}>
            Un lien de confirmation a été envoyé à <strong style={{ color: 'var(--text)' }}>{email}</strong>.
          </p>
          <button onClick={() => navigate('/')} style={{ ...ctaStyle, marginTop: 24 }}>
            {isBrutale ? 'ACCUEIL' : "Revenir à l'accueil"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 'var(--page-h)', paddingTop: 'var(--safe-top)', background: 'var(--bg)' }}>
      <div style={cardStyle}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: isBrutale ? 'normal' : 'italic', marginBottom: 8, fontSize: isBrutale ? 36 : 24, fontWeight: 700, color: isBrutale ? 'var(--accent)' : 'var(--text)', textTransform: isBrutale ? 'uppercase' : 'none' }}>
          {isBrutale ? 'CRÉER UN COMPTE' : 'Créer un compte'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, fontFamily: 'var(--font-ui)' }}>
          Sauvegardez vos piscines sur le cloud.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label htmlFor="reg-email" style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: isBrutale ? '3px' : '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6, textAlign: 'left', fontFamily: 'var(--font-ui)' }}>Email</label>
              <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={inputStyle} placeholder="vous@exemple.fr" required />
            </div>
            <div>
              <label htmlFor="reg-password" style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: isBrutale ? '3px' : '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6, textAlign: 'left', fontFamily: 'var(--font-ui)' }}>Mot de passe</label>
              <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" style={inputStyle} placeholder="8 caractères minimum" minLength={8} required />
            </div>

            {(validationError ?? error) && (
              <p role="alert" style={{ color: isBrutale ? 'var(--red, #FF2D00)' : 'var(--peach, #FF7E5F)', fontSize: 14, fontFamily: 'var(--font-ui)' }}>
                {validationError ?? error}
              </p>
            )}

            <button type="submit" disabled={loading} style={{ ...ctaStyle, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Création…' : (isBrutale ? 'CRÉER MON COMPTE' : 'Créer mon compte')}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
          Déjà un compte ?{' '}
          <Link to="/auth/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            {isBrutale ? 'SE CONNECTER' : 'Se connecter'}
          </Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer', minHeight: 44, fontFamily: 'var(--font-ui)' }}>
            Plus tard
          </button>
        </p>
      </div>
    </div>
  )
}
