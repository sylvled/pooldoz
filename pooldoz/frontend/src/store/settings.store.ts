import { create } from 'zustand'
import { db, type Theme, type Langue, type Settings } from '@/lib/db'

interface SettingsStore {
  theme: Theme
  langue: Langue
  dernierePiscineId: string | null
  loading: boolean
  error: string | null

  init: (settings: Settings) => void
  setTheme: (theme: Theme) => Promise<void>
  setLangue: (langue: Langue) => Promise<void>
  setDernierePiscineId: (id: string | null) => Promise<void>
  clearError: () => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: 'balnea',
  langue: 'fr',
  dernierePiscineId: null,
  loading: false,
  error: null,

  init: (settings: Settings) => {
    set({
      theme: settings.theme,
      langue: settings.langue,
      dernierePiscineId: settings.dernierePiscineId,
    })
    applyThemeToDom(settings.theme)
  },

  setTheme: async (theme: Theme) => {
    applyThemeToDom(theme)
    set({ theme })
    try {
      await db.settings.update(1, { theme })
    } catch {
      set({ error: 'Impossible de sauvegarder le thème.' })
    }
  },

  setLangue: async (langue: Langue) => {
    set({ langue })
    try {
      await db.settings.update(1, { langue })
    } catch {
      set({ error: 'Impossible de sauvegarder la langue.' })
    }
  },

  setDernierePiscineId: async (id: string | null) => {
    set({ dernierePiscineId: id })
    try {
      await db.settings.update(1, { dernierePiscineId: id })
    } catch {
      set({ error: 'Impossible de sauvegarder la piscine active.' })
    }
  },

  clearError: () => set({ error: null }),
}))

function applyThemeToDom(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}
