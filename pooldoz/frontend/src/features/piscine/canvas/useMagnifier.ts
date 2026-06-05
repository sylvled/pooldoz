import { useState, useRef, useCallback } from 'react'

export interface MagnifierState {
  active: boolean
  x: number // SVG normalized [0..1]
  y: number
}

const PRESS_MS = 150

/** Loupe ×3 — activée après 150ms de pression sur un vertex/endpoint */
export function useMagnifier() {
  const [magnifier, setMagnifier] = useState<MagnifierState>({ active: false, x: 0, y: 0 })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startPress = useCallback((x: number, y: number) => {
    timerRef.current = setTimeout(() => {
      setMagnifier({ active: true, x, y })
    }, PRESS_MS)
  }, [])

  const updatePosition = useCallback((x: number, y: number) => {
    setMagnifier((prev) => (prev.active ? { ...prev, x, y } : prev))
  }, [])

  const endPress = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMagnifier({ active: false, x: 0, y: 0 })
  }, [])

  return { magnifier, startPress, updatePosition, endPress }
}
