'use client'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="chart-tooltip">
      <p className="text-caption text-fog mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="font-mono text-sm">
          {entry.dataKey === 'weight' && (
            <span className="text-fjord">{entry.value} kg</span>
          )}
          {entry.dataKey === 'average' && (
            <span className="text-ember">{entry.value} kg avg</span>
          )}
        </p>
      ))}
    </div>
  )
}
