/**
 * useThemeLongPress — attach to the logo element.
 * After 600ms press → triggers the animated theme morph (UX-DR14).
 * Cooldown 800ms after each transition.
 *
 * triggerMorphTransition — can also be called directly (from ReglagesScreen).
 *
 * Animation sequence (700–900ms total):
 *   0ms     : set [data-morphing] → blobs pause via CSS
 *   200ms   : swap data-theme     → CSS var transitions fire (400ms ease)
 *   600ms   : palette done, Brutale geometry border-radius transition starts (300ms)
 *   900ms   : remove [data-morphing], cleanup
 */
import { useRef, useCallback } from 'react'
import { useSettingsStore } from '@/store/settings.store'
import type { Theme } from '@/lib/db'

const LONG_PRESS_MS = 600
const COOLDOWN_MS   = 900   // matches animation total

let globalCooldown = false

export function useThemeLongPress() {
  const { theme, setTheme } = useSettingsStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startPress = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      if (globalCooldown) return
      timerRef.current = setTimeout(() => {
        const next: Theme = theme === 'balnea' ? 'brutale' : 'balnea'
        triggerMorphTransition(next, () => void setTheme(next))
      }, LONG_PRESS_MS)
    },
    [theme, setTheme],
  )

  const cancelPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return { startPress, cancelPress }
}

/**
 * Trigger the 3-phase animated theme morph.
 * Can be called directly (e.g. from ReglagesScreen theme buttons).
 */
export function triggerMorphTransition(next: Theme, onSwap: () => void) {
  const html = document.documentElement

  // Prevent overlapping transitions
  if (globalCooldown) return
  globalCooldown = true

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) {
    html.setAttribute('data-theme', next)
    onSwap()
    globalCooldown = false
    return
  }

  // Phase 1 (0ms): set [data-morphing] → CSS handles blob freeze + transition setup
  html.setAttribute('data-morphing', 'true')

  // Phase 2 (200ms): swap theme → CSS var transitions fire
  setTimeout(() => {
    html.setAttribute('data-theme', next)
    onSwap()
  }, 200)

  // Phase 3 (900ms): cleanup
  setTimeout(() => {
    html.removeAttribute('data-morphing')
    globalCooldown = false
  }, COOLDOWN_MS)
}
