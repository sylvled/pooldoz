import { useState, useCallback } from 'react'

export interface CalibrationLine {
  p1: { x: number; y: number }
  p2: { x: number; y: number }
  realLength: number | null // metres
}

const INITIAL: CalibrationLine = {
  p1: { x: 0.2, y: 0.5 },
  p2: { x: 0.8, y: 0.5 },
  realLength: null,
}

export function useCalibrationLine() {
  const [line, setLine] = useState<CalibrationLine>(INITIAL)
  const [dragging, setDragging] = useState<'p1' | 'p2' | null>(null)

  const startDrag = useCallback((endpoint: 'p1' | 'p2') => {
    setDragging(endpoint)
  }, [])

  const updateDrag = useCallback(
    (pt: { x: number; y: number }) => {
      if (!dragging) return
      setLine((prev) => ({ ...prev, [dragging]: pt }))
    },
    [dragging],
  )

  const endDrag = useCallback(() => {
    setDragging(null)
  }, [])

  const setRealLength = useCallback((metres: number) => {
    setLine((prev) => ({ ...prev, realLength: metres }))
  }, [])

  /** Pixels per metre scale factor — used to scale the plan */
  const getScale = useCallback(
    (svgW: number, svgH: number): number | null => {
      if (!line.realLength) return null
      const dx = (line.p2.x - line.p1.x) * svgW
      const dy = (line.p2.y - line.p1.y) * svgH
      const pixelLen = Math.sqrt(dx * dx + dy * dy)
      return pixelLen / line.realLength // pixels per metre
    },
    [line],
  )

  return { line, dragging, startDrag, updateDrag, endDrag, setRealLength, getScale }
}
