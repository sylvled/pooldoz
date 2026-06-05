/**
 * NavBar — fixed bottom navigation, 4 tabs.
 *
 * Balnéa: cream bg, violet active, emoji icons, rounded active bg.
 * Brutale: black bg, acid active color, monospace labels, no rounded corners.
 *
 * Uses CSS variables only.
 */
import { NavLink } from 'react-router-dom'
import { useSettingsStore } from '@/store/settings.store'

const NAV_ITEMS = [
  { to: '/',          label: 'Dosage',   icon: '💧' },
  { to: '/piscine',   label: 'Piscine',  icon: '🏊' },
  { to: '/journal',   label: 'Journal',  icon: '📋' },
  { to: '/reglages',  label: 'Réglages', icon: '⚙️' },
] as const

export function NavBar() {
  const theme = useSettingsStore((s) => s.theme)
  const isBrutale = theme === 'brutale'

  return (
    <nav
      role="navigation"
      aria-label="Navigation principale"
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        display: 'flex',
        padding: isBrutale ? '0' : '6px 0',
        paddingBottom: `calc(${isBrutale ? '0px' : '6px'} + env(safe-area-inset-bottom))`,
        background: 'var(--bg)',
        borderTop: isBrutale ? '3px solid var(--border-color)' : '1px solid var(--border-color)',
        zIndex: 100,
        height: isBrutale ? `calc(52px + env(safe-area-inset-bottom))` : `calc(60px + env(safe-area-inset-bottom))`,
      }}
    >
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          aria-label={label}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isBrutale ? 2 : 3,
            textDecoration: 'none',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: isBrutale ? '2px' : '0.5px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-ui)',
            color: isActive ? 'var(--nav-active)' : 'var(--text-secondary)',
            cursor: 'pointer',
            borderTop: isBrutale && isActive ? '3px solid var(--accent)' : isBrutale ? '3px solid transparent' : 'none',
            marginTop: isBrutale ? -3 : 0,
          })}
        >
          {({ isActive }) => (
            <>
              <div
                aria-hidden="true"
                style={{
                  width: 34, height: 34,
                  borderRadius: isBrutale ? 0 : 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17,
                  background: isActive && !isBrutale ? 'rgba(45,27,105,0.08)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                {icon}
              </div>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
