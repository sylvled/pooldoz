/**
 * Seasonal reminder logic — mai (opening) + septembre (winterisation).
 * Returns true if the reminder should be shown this launch.
 */
export function shouldShowSeasonBanner(
  lastSessionTimestamp: number | null,
  dismissedYear: number | null,
): boolean {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-based
  const year = now.getFullYear()

  // Only show in May (opening) or September (closing)
  if (month !== 5 && month !== 9) return false

  // Already dismissed this year
  if (dismissedYear === year) return false

  // No sessions ever — show the banner
  if (!lastSessionTimestamp) return true

  // Last session was more than 6 months ago
  const sixMonthsMs = 6 * 30 * 24 * 60 * 60 * 1000
  return Date.now() - lastSessionTimestamp > sixMonthsMs
}
