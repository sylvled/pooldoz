import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { NavBar } from '@/components/NavBar'
import { AccountPrompt } from '@/components/AccountPrompt'
import { useAuthStore } from '@/features/auth/auth.store'
import { usePiscines } from '@/hooks/usePiscines'
import { initSettings } from '@/lib/db'
import { useSettingsStore } from '@/store/settings.store'
import { changeLanguage } from '@/lib/i18n'

const ROUTES_WITHOUT_NAV = ['/auth/register', '/auth/login', '/onboarding']

function SyncIndicator() {
  const syncStatus = useAuthStore((s) => s.syncStatus)
  const user = useAuthStore((s) => s.user)
  if (!user || syncStatus === 'idle') return null
  return (
    <div
      aria-label="Synchronisation en cours"
      style={{
        position: 'fixed', top: 16, right: 16, zIndex: 90,
        width: 8, height: 8, borderRadius: '50%',
        background: syncStatus === 'syncing' ? 'var(--aqua)' : 'var(--peach)',
      }}
    />
  )
}

function App() {
  const { pathname } = useLocation()
  const hideNav = ROUTES_WITHOUT_NAV.some((r) => pathname.startsWith(r))

  usePiscines()

  useEffect(() => {
    initSettings()
      .then((settings) => {
        useSettingsStore.getState().init(settings)
        void changeLanguage(settings.langue)
      })
      .catch((e) => {
        console.error('[App] Settings init failed:', e)
        document.documentElement.setAttribute('data-theme', 'balnea')
      })

    void useAuthStore.getState().init().catch(() => {
      // Supabase offline — local mode
    })
  }, []) // mount-only — intentional

  return (
    <>
      <SyncIndicator />
      <AccountPrompt />
      <main style={{ flex: 1, paddingBottom: hideNav ? 0 : 'calc(60px + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>
      {!hideNav && <NavBar />}
    </>
  )
}

export default App
