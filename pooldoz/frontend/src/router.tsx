import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, useRouteError, Link } from 'react-router-dom'
import App from './App'

type AnyModule = Record<string, ComponentType>

function screen(loader: () => Promise<AnyModule>, key: string) {
  const Lazy = lazy(() => loader().then((m) => ({ default: m[key] })))
  return <Suspense fallback={null}><Lazy /></Suspense>
}

function RouteError() {
  const error = useRouteError() as { status?: number; statusText?: string; message?: string }
  const is404 = error?.status === 404
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 24, background: 'var(--bg)', textAlign: 'center', gap: 16 }}>
      <span style={{ fontSize: 48 }}>{is404 ? '🔍' : '⚠️'}</span>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
        {is404 ? 'Page introuvable' : 'Une erreur est survenue'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontFamily: 'var(--font-ui)' }}>
        {error?.statusText ?? error?.message ?? 'Erreur inattendue'}
      </p>
      <Link to="/" style={{ marginTop: 8, background: 'var(--accent)', color: is404 ? 'var(--ink, #0A0A0A)' : '#fff', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 15, textDecoration: 'none', fontFamily: 'var(--font-ui)' }}>
        ← Retour à l'accueil
      </Link>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteError />,
    children: [
      { index: true,         element: screen(() => import('@/features/dosage/DosageScreen'),           'DosageScreen') },
      { path: 'piscine',     element: screen(() => import('@/features/piscine/PiscineScreen'),         'PiscineScreen') },
      { path: 'journal',     element: screen(() => import('@/features/journal/JournalScreen'),         'JournalScreen') },
      { path: 'reglages',    element: screen(() => import('@/features/reglages/ReglagesScreen'),       'ReglagesScreen') },
      { path: 'onboarding',  element: screen(() => import('@/features/onboarding/OnboardingScreen'),   'OnboardingScreen') },
      { path: 'privacy',     element: screen(() => import('@/features/legal/PrivacyScreen'),           'PrivacyScreen') },
      { path: 'auth/register', element: screen(() => import('@/features/auth/RegisterScreen'),         'RegisterScreen') },
      { path: 'auth/login',    element: screen(() => import('@/features/auth/LoginScreen'),            'LoginScreen') },
      { path: 'climax',      element: screen(() => import('@/features/piscine/canvas/ClimaxScreen'),   'ClimaxScreen') },
    ],
  },
])
