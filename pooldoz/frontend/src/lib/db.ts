import Dexie, { type EntityTable } from 'dexie'

export type Theme = 'balnea' | 'brutale'
export type Langue = 'fr' | 'en'

export interface Settings {
  id: 1 // singleton row
  theme: Theme
  langue: Langue
  dernierePiscineId: string | null
  seasonBannerDismissedYear: number | null
}

export interface Piscine {
  id: string
  nom: string
  plan: Array<{ x: number; y: number }> // normalized [0..1]
  zones: Array<{
    id: string
    points: Array<{ x: number; y: number }>
    depthA: number // metres
    depthB: number | null // null = flat bottom, non-null = sloped
  }>
  volume: number | null // m³
  coteCalibrage: { pixelLength: number; realLength: number } | null
  syncedAt: number | null // timestamp ms
  updatedAt: number // timestamp ms
}

export interface Session {
  id: string
  piscineId: string
  produit: string
  tauxMesure: number | null
  dose: number | null
  valide: boolean
  createdAt: number // timestamp ms
}

class PoolDozDB extends Dexie {
  settings!: EntityTable<Settings, 'id'>
  piscines!: EntityTable<Piscine, 'id'>
  sessions!: EntityTable<Session, 'id'>

  constructor() {
    super('PoolDoz')
    this.version(1).stores({
      settings: 'id',
      piscines: 'id, updatedAt, syncedAt',
      sessions: 'id, piscineId, produit, createdAt',
    })
  }
}

export const db = new PoolDozDB()

/** Ensure settings row exists with defaults */
export async function initSettings(): Promise<Settings> {
  const existing = await db.settings.get(1)
  if (existing) return existing

  const defaults: Settings = {
    id: 1,
    theme: 'balnea',
    langue: 'fr',
    dernierePiscineId: null,
    seasonBannerDismissedYear: null,
  }
  await db.settings.add(defaults)
  return defaults
}
