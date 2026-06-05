type StepStatus = 'done' | 'active' | 'todo'

interface Step {
  label: string
  status: StepStatus
}

interface StepPillsProps {
  steps: Step[]
  onStepClick?: (index: number) => void
}

const STATUS_STYLES: Record<StepStatus, React.CSSProperties> = {
  done: {
    background: 'rgba(61,184,184,0.2)',
    color: 'var(--aqua)',
  },
  active: {
    background: 'var(--aqua)',
    color: '#fff',
  },
  todo: {
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.4)',
  },
}

export function StepPills({ steps, onStepClick }: StepPillsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        padding: '8px var(--page-h)',
        height: 40,
        alignItems: 'center',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {steps.map((step, i) => (
        <button
          key={step.label}
          onClick={() => step.status === 'done' && onStepClick?.(i)}
          disabled={step.status === 'todo'}
          style={{
            flexShrink: 0,
            height: 28,
            padding: '0 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: step.status === 'done' ? 'pointer' : 'default',
            border: 'none',
            transition: 'background 0.2s',
            ...STATUS_STYLES[step.status],
          }}
        >
          {step.status === 'done' && '✓ '}
          {step.label}
        </button>
      ))}
    </div>
  )
}
