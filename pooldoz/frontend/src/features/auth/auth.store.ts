import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/db'

type SyncStatus = 'idle' | 'pending' | 'syncing' | 'error'

interface AuthStore {
  user: User | null
  session: Session | null
  syncStatus: SyncStatus
  loading: boolean
  error: string | null

  init: () => Promise<void>
  register: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  deleteAccount: () => Promise<void>
  setSyncStatus: (s: SyncStatus) => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  syncStatus: 'idle',
  loading: false,
  error: null,

  init: async () => {
    const { data } = await supabase.auth.getSession()
    set({ session: data.session, user: data.session?.user ?? null })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  register: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      set({ loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      set({ user: data.user, session: data.session, loading: false })
    } catch (e) {
      const msg = (e as Error).message
      // Never expose which field is wrong — generic message
      const safeMsg = msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')
        ? 'Email ou mot de passe incorrect.'
        : 'Connexion impossible. Réessayez.'
      set({ error: safeMsg, loading: false })
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, syncStatus: 'idle' })
  },

  deleteAccount: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.rpc('delete_user')
      if (error) throw error
      // Clear local Dexie data
      await db.piscines.clear()
      await db.sessions.clear()
      await db.settings.put({
        id: 1,
        theme: 'balnea',
        langue: 'fr',
        dernierePiscineId: null,
        seasonBannerDismissedYear: null,
      })
      await supabase.auth.signOut()
      set({ user: null, session: null, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  setSyncStatus: (syncStatus) => set({ syncStatus }),

  clearError: () => set({ error: null }),
}))

// Auth init is called explicitly from main.tsx — not auto-run here
// (avoids network errors crashing bootstrap when Supabase isn't running)
