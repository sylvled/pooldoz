const PEBBLE_COUNT = 12

type GaugeStatus = 'optimal' | 'low' | 'high' | 'critical'

interface PebbleGaugeProps {
  value: number
  target: number
  status: GaugeStatus
}

function pebbleColor(index: number, markerIndex: number, status: GaugeStatus): string {
  if (index >= markerIndex) return 'var(--faint)'
  if (status === 'optimal') return 'var(--aqua)'
  if (status === 'critical') return '#ff2d00'
  return 'var(--peach)'
}

export function PebbleGauge({ value, target, status }: PebbleGaugeProps) {
  const ratio = target > 0 ? Math.min(Math.max(value / target, 0), 1.5) : 0
  const markerIndex = Math.round(ratio * PEBBLE_COUNT)
  const filledCount = Math.min(markerIndex, PEBBLE_COUNT)

  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={target * 1.5}
      aria-label={`Niveau : ${value} sur cible ${target}`}
      style={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', height: 24 }}
    >
      {Array.from({ length: PEBBLE_COUNT }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: i < filledCount ? 20 : 14,
            borderRadius: 'var(--radius-full)',
            background: pebbleColor(i, filledCount, status),
            transition: 'background 0.2s, height 0.2s',
            minWidth: 0,
          }}
        />
      ))}
      {/* Target marker */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: `calc(${(1 / PEBBLE_COUNT) * 100 * Math.min(PEBBLE_COUNT, PEBBLE_COUNT)}% - 1px)`,
          width: 2,
          height: 28,
          background: 'var(--aqua)',
          borderRadius: 1,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  )
}
