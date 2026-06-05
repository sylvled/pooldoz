import { create } from 'zustand'
import type { Produit } from '@/lib/chemistry'

export const PRODUITS: Produit[] = ['sel', 'chlore', 'ph_plus', 'ph_moins', 'tac', 'algicide', 'stabilisant']

export const PRODUIT_LABELS: Record<Produit, string> = {
  sel: 'Sel',
  chlore: 'Chlore',
  ph_plus: 'pH+',
  ph_moins: 'pH−',
  tac: 'TAC',
  algicide: 'Algicide',
  stabilisant: 'Stabilisant',
}

export const PRODUIT_UNITS: Record<Produit, string> = {
  sel: 'PPM',
  chlore: 'mg/L',
  ph_plus: 'pH',
  ph_moins: 'pH',
  tac: 'mg/L',
  algicide: '—',
  stabilisant: '—',
}

export const DEFAULT_TARGETS: Record<Produit, number> = {
  sel: 3200,
  chlore: 1.5,
  ph_plus: 7.4,
  ph_moins: 7.4,
  tac: 120,
  algicide: 0,
  stabilisant: 0,
}

export const PREVENTIVE: Set<Produit> = new Set(['algicide', 'stabilisant'])

interface DosageStore {
  produitActif: Produit
  tauxMesure: string // string for controlled input
  loading: boolean
  error: string | null
  targets: Record<Produit, number>

  setProduit: (p: Produit) => void
  setTauxMesure: (v: string) => void
  resetMesure: () => void
  setTarget: (p: Produit, v: number) => void
  resetTarget: (p: Produit) => void
  clearError: () => void
}

export const useDosageStore = create<DosageStore>((set) => ({
  produitActif: 'sel',
  tauxMesure: '',
  loading: false,
  error: null,
  targets: { ...DEFAULT_TARGETS },

  setProduit: (p) => set({ produitActif: p, tauxMesure: '' }),
  setTauxMesure: (v) => set({ tauxMesure: v }),
  resetMesure: () => set({ tauxMesure: '' }),
  setTarget: (p, v) =>
    set((s) => ({ targets: { ...s.targets, [p]: v } })),
  resetTarget: (p) =>
    set((s) => ({ targets: { ...s.targets, [p]: DEFAULT_TARGETS[p] } })),
  clearError: () => set({ error: null }),
}))
