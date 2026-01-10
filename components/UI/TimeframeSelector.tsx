'use client'

import type { ProjectionTimeframe } from '../../lib/types'
import { TIMEFRAME_OPTIONS } from '../../lib/projectionUtils'

interface TimeframeSelectorProps {
  value: ProjectionTimeframe
  onChange: (timeframe: ProjectionTimeframe) => void
  className?: string
}

export function TimeframeSelector({
  value,
  onChange,
  className = ''
}: TimeframeSelectorProps) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {TIMEFRAME_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-2 py-1 text-xs rounded-md transition-all
            ${value === option.value
              ? 'bg-ember text-bone font-medium'
              : 'glass-recessed text-stone hover:text-fog hover:bg-white/5'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
