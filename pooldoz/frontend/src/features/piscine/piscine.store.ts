import { create } from 'zustand'
import { db, type Piscine } from '@/lib/db'
import { useSettingsStore } from '@/store/settings.store'

interface PiscineStore {
  piscines: Piscine[]
  activePiscineId: string | null
  loading: boolean
  error: string | null

  setPiscines: (piscines: Piscine[]) => void // called by useLiveQuery hook
  setActivePiscine: (id: string) => void
  createPiscine: (nom: string) => Promise<string>
  deletePiscine: (id: string) => Promise<void>
  updatePiscine: (id: string, patch: Partial<Omit<Piscine, 'id'>>) => Promise<void>
  clearError: () => void
}

export const usePiscineStore = create<PiscineStore>((set, get) => ({
  piscines: [],
  activePiscineId: null,
  loading: false,
  error: null,

  // Called by usePiscines hook whenever Dexie data changes
  setPiscines: (piscines: Piscine[]) => {
    const { activePiscineId } = get()
    const { dernierePiscineId } = useSettingsStore.getState()

    // Preserve or resolve active piscine
    const validActive = piscines.find((p) => p.id === activePiscineId)
    const preferred = piscines.find((p) => p.id === dernierePiscineId)
    const resolved =
      validActive?.id ?? preferred?.id ?? (piscines.length === 1 ? piscines[0].id : null)

    set({ piscines, activePiscineId: resolved })
  },

  setActivePiscine: (id: string) => {
    set({ activePiscineId: id })
    void useSettingsStore.getState().setDernierePiscineId(id)
  },

  createPiscine: async (nom: string) => {
    const id = crypto.randomUUID()
    const now = Date.now()
    const piscine: Piscine = {
      id, nom, plan: [], zones: [], volume: null,
      coteCalibrage: null, syncedAt: null, updatedAt: now,
    }
    await db.piscines.add(piscine)
    return id
  },

  deletePiscine: async (id: string) => {
    await db.piscines.delete(id)
    const { activePiscineId } = get()
    if (activePiscineId === id) {
      set({ activePiscineId: null })
      void useSettingsStore.getState().setDernierePiscineId(null)
    }
  },

  updatePiscine: async (id: string, patch: Partial<Omit<Piscine, 'id'>>) => {
    await db.piscines.update(id, { ...patch, updatedAt: Date.now() })
  },

  clearError: () => set({ error: null }),
}))
