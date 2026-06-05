import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { usePiscineStore } from '@/features/piscine/piscine.store'

/**
 * Subscribe to Dexie piscines and sync into Zustand.
 * Mount once in App — gives all screens reactive access via usePiscineStore.
 */
export function usePiscines() {
  const piscines = useLiveQuery(
    () => db.piscines.orderBy('updatedAt').reverse().toArray(),
    [],
    [],
  )
  const setPiscines = usePiscineStore((s) => s.setPiscines)

  useEffect(() => {
    if (piscines) setPiscines(piscines)
  }, [piscines, setPiscines])
}
