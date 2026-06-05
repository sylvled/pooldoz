import { useState, useCallback } from 'react'

export interface DepthZone {
  id: string
  /** Separator position as fraction [0..1] along the long axis */
  separator: number
  depthA: number // shallow end (metres)
  depthB: number | null // null = flat bottom; non-null = sloped (deep end)
}

const DEFAULT_ZONES: DepthZone[] = [
  { id: 'z1', separator: 0.5, depthA: 1.2, depthB: null },
  { id: 'z2', separator: 1.0, depthA: 1.8, depthB: null },
]

function nanoid() {
  return Math.random().toString(36).slice(2, 10)
}

export function useDepthZones() {
  const [zones, setZones] = useState<DepthZone[]>(DEFAULT_ZONES)
  const [draggingSepIndex, setDraggingSepIndex] = useState<number | null>(null)

  const allCovered = zones.length > 0 && zones[zones.length - 1].separator >= 1.0

  const startDragSep = useCallback((index: number) => {
    setDraggingSepIndex(index)
  }, [])

  const updateSepPosition = useCallback(
    (fraction: number) => {
      if (draggingSepIndex === null) return
      setZones((prev) => {
        const updated = [...prev]
        const minFrac = draggingSepIndex > 0 ? prev[draggingSepIndex - 1].separator + 0.05 : 0.05
        const maxFrac =
          draggingSepIndex < prev.length - 1
            ? prev[draggingSepIndex + 1].separator - 0.05
            : 0.95
        updated[draggingSepIndex] = {
          ...updated[draggingSepIndex],
          separator: Math.max(minFrac, Math.min(maxFrac, fraction)),
        }
        return updated
      })
    },
    [draggingSepIndex],
  )

  const endDragSep = useCallback(() => {
    setDraggingSepIndex(null)
  }, [])

  const setDepth = useCallback((zoneId: string, field: 'depthA' | 'depthB', value: number | null) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, [field]: value } : z)),
    )
  }, [])

  const addZone = useCallback(() => {
    setZones((prev) => {
      const last = prev[prev.length - 1]
      const newSep = Math.min((last.separator + 1.0) / 2, 0.95)
      return [
        ...prev.slice(0, -1),
        { ...last, separator: newSep },
        { id: nanoid(), separator: 1.0, depthA: 1.8, depthB: null },
      ]
    })
  }, [])

  const removeZone = useCallback((zoneId: string) => {
    setZones((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((z) => z.id !== zoneId)
    })
  }, [])

  return {
    zones,
    draggingSepIndex,
    allCovered,
    startDragSep,
    updateSepPosition,
    endDragSep,
    setDepth,
    addZone,
    removeZone,
  }
}
