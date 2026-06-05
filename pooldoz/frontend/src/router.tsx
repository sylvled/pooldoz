import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App'

type AnyModule = Record<string, ComponentType>

function screen(loader: () => Promise<AnyModule>, key: string) {
  const Lazy = lazy(() => loader().then((m) => ({ default: m[key] })))
  return <Suspense fallback={null}><Lazy /></Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: screen(() => import('@/features/dosage/DosageScreen'), 'DosageScreen') },
      { path: 'piscine', element: screen(() => import('@/features/piscine/PiscineScreen'), 'PiscineScreen') },
      { path: 'journal', element: screen(() => import('@/features/journal/JournalScreen'), 'JournalScreen') },
      { path: 'reglages', element: screen(() => import('@/features/reglages/ReglagesScreen'), 'ReglagesScreen') },
      { path: 'onboarding', element: screen(() => import('@/features/onboarding/OnboardingScreen'), 'OnboardingScreen') },
      { path: 'privacy', element: screen(() => import('@/features/legal/PrivacyScreen'), 'PrivacyScreen') },
      { path: 'auth/register', element: screen(() => import('@/features/auth/RegisterScreen'), 'RegisterScreen') },
      { path: 'auth/login', element: screen(() => import('@/features/auth/LoginScreen'), 'LoginScreen') },
    ],
  },
])
