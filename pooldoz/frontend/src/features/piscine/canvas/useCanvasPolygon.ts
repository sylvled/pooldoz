import { useState, useCallback } from 'react'

export interface Point {
  x: number
  y: number
}

interface PolygonState {
  points: Point[]
  closed: boolean
  draggingIndex: number | null
}

const CLOSE_THRESHOLD = 0.03 // 3% of SVG size to close polygon
const SNAP_ANGLE_THRESHOLD = 8 // degrees — snap to right angle if within this

function snapToRightAngle(prev: Point, curr: Point, snapEnabled: boolean): Point {
  if (!snapEnabled || !prev) return curr
  const dx = curr.x - prev.x
  const dy = curr.y - prev.y
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  // Normalize to [0, 90] bracket
  const mod = ((angle % 90) + 90) % 90
  const distToRight = Math.min(mod, 90 - mod)
  if (distToRight < SNAP_ANGLE_THRESHOLD) {
    const snappedAngle = Math.round(angle / 90) * 90 * (Math.PI / 180)
    const dist = Math.sqrt(dx * dx + dy * dy)
    return {
      x: prev.x + Math.cos(snappedAngle) * dist,
      y: prev.y + Math.sin(snappedAngle) * dist,
    }
  }
  return curr
}

function distanceSq(a: Point, b: Point): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2
}

export function useCanvasPolygon(snapAngles = false) {
  const [state, setState] = useState<PolygonState>({
    points: [],
    closed: false,
    draggingIndex: null,
  })

  const addPoint = useCallback(
    (pt: Point) => {
      setState((prev) => {
        if (prev.closed) return prev
        if (prev.points.length >= 3) {
          // Check if clicking near first point to close
          if (distanceSq(pt, prev.points[0]) < CLOSE_THRESHOLD ** 2) {
            return { ...prev, closed: true, draggingIndex: null }
          }
        }
        const last = prev.points[prev.points.length - 1]
        const snapped = last ? snapToRightAngle(last, pt, snapAngles) : pt
        return { ...prev, points: [...prev.points, snapped] }
      })
    },
    [snapAngles],
  )

  const startDrag = useCallback((index: number) => {
    setState((prev) => ({ ...prev, draggingIndex: index }))
  }, [])

  const updateDrag = useCallback(
    (pt: Point) => {
      setState((prev) => {
        if (prev.draggingIndex === null) return prev
        const points = [...prev.points]
        const prevPt = points[(prev.draggingIndex - 1 + points.length) % points.length]
        const snapped = snapToRightAngle(prevPt, pt, snapAngles)
        points[prev.draggingIndex] = snapped
        return { ...prev, points }
      })
    },
    [snapAngles],
  )

  const endDrag = useCallback(() => {
    setState((prev) => ({ ...prev, draggingIndex: null }))
  }, [])

  const closePolygon = useCallback(() => {
    setState((prev) =>
      prev.points.length >= 3 ? { ...prev, closed: true, draggingIndex: null } : prev,
    )
  }, [])

  const reset = useCallback(() => {
    setState({ points: [], closed: false, draggingIndex: null })
  }, [])

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.closed) return { ...prev, closed: false }
      if (prev.points.length === 0) return prev
      return { ...prev, points: prev.points.slice(0, -1) }
    })
  }, [])

  return {
    points: state.points,
    closed: state.closed,
    draggingIndex: state.draggingIndex,
    addPoint,
    startDrag,
    updateDrag,
    endDrag,
    closePolygon,
    reset,
    undo,
  }
}
