import type { CSSProperties } from 'react'

interface BlobDecoProps {
  size?: number
  color?: string
  style?: CSSProperties
  durationSec?: number
}

/**
 * Animated morphing blob — Balnéa theme only.
 * Max 2 per screen. pointer-events: none.
 * Suppressed automatically via prefers-reduced-motion in global.css.
 */
export function BlobDeco({
  size = 200,
  color = 'var(--violet-mid)',
  style,
  durationSec = 10,
}: BlobDecoProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        backgroundColor: color,
        opacity: 0.22,
        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
        animation: `blob-morph ${durationSec}s ease-in-out infinite`,
        pointerEvents: 'none',
        willChange: 'border-radius',
        ...style,
      }}
    />
  )
}
