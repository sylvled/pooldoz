/**
 * Local-first sync: write-local → sync-background-async.
 * Never blocks the UI. last-write-wins on updatedAt.
 */
import { db } from './db'
import { supabase } from './supabase'
import { useAuthStore } from '@/features/auth/auth.store'

export async function syncPiscines(): Promise<void> {
  const { user } = useAuthStore.getState()
  if (!user) return

  useAuthStore.getState().setSyncStatus('syncing')
  try {
    const unsynced = await db.piscines
      .filter((p) => p.syncedAt === null || p.updatedAt > (p.syncedAt ?? 0))
      .toArray()

    for (const p of unsynced) {
      const { error } = await supabase.from('piscines').upsert({
        id: p.id,
        user_id: user.id,
        nom: p.nom,
        plan_json: p.plan,
        zones_json: p.zones,
        volume: p.volume,
        cote_calibrage: p.coteCalibrage,
        updated_at: new Date(p.updatedAt).toISOString(),
      })
      if (!error) {
        await db.piscines.update(p.id, { syncedAt: Date.now() })
      }
    }

    useAuthStore.getState().setSyncStatus('idle')
  } catch {
    useAuthStore.getState().setSyncStatus('error')
  }
}

export async function syncSessions(): Promise<void> {
  const { user } = useAuthStore.getState()
  if (!user) return

  try {
    const all = await db.sessions.toArray()
    for (const s of all) {
      await supabase.from('sessions').upsert({
        id: s.id,
        piscine_id: s.piscineId,
        user_id: user.id,
        produit: s.produit,
        taux_mesure: s.tauxMesure,
        dose: s.dose,
        valide: s.valide,
        created_at: new Date(s.createdAt).toISOString(),
      })
    }
  } catch {
    // sync errors are non-blocking
  }
}

/** Pull cloud piscines to local Dexie (last-write-wins by updatedAt) */
export async function pullPiscines(): Promise<void> {
  const { user } = useAuthStore.getState()
  if (!user) return

  try {
    const { data, error } = await supabase
      .from('piscines')
      .select('*')
      .eq('user_id', user.id)

    if (error || !data) return

    for (const row of data) {
      const local = await db.piscines.get(row.id)
      const remoteUpdated = new Date(row.updated_at).getTime()
      if (!local || remoteUpdated > (local.updatedAt ?? 0)) {
        await db.piscines.put({
          id: row.id,
          nom: row.nom,
          plan: row.plan_json ?? [],
          zones: row.zones_json ?? [],
          volume: row.volume,
          coteCalibrage: row.cote_calibrage,
          syncedAt: remoteUpdated,
          updatedAt: remoteUpdated,
        })
      }
    }
  } catch {
    // non-blocking
  }
}

/** Fire and forget — never awaited by callers */
export function syncAll(): void {
  void syncPiscines()
  void syncSessions()
}
