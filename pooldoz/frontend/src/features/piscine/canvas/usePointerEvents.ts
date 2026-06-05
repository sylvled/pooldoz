import { useCallback } from 'react'
import type { RefObject } from 'react'

export interface PointerPoint {
  x: number
  y: number
  pointerId: number
}

interface UsePointerEventsOptions {
  svgRef: RefObject<SVGSVGElement | null>
  onPointerDown?: (pt: PointerPoint) => void
  onPointerMove?: (pt: PointerPoint) => void
  onPointerUp?: (pt: PointerPoint) => void
}

/** Convert DOM pointer event to normalized SVG coordinates [0..1] */
function toSvgPoint(e: PointerEvent, svg: SVGSVGElement): PointerPoint {
  const rect = svg.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) / rect.width,
    y: (e.clientY - rect.top) / rect.height,
    pointerId: e.pointerId,
  }
}

export function usePointerEvents({
  svgRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: UsePointerEventsOptions) {
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      if (svgRef.current && onPointerDown) {
        onPointerDown(toSvgPoint(e.nativeEvent, svgRef.current))
      }
    },
    [svgRef, onPointerDown],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (svgRef.current && onPointerMove) {
        onPointerMove(toSvgPoint(e.nativeEvent, svgRef.current))
      }
    },
    [svgRef, onPointerMove],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (svgRef.current && onPointerUp) {
        onPointerUp(toSvgPoint(e.nativeEvent, svgRef.current))
      }
    },
    [svgRef, onPointerUp],
  )

  return { handlePointerDown, handlePointerMove, handlePointerUp }
}
