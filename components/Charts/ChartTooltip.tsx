'use client'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number | null; dataKey: string; name?: string }>
  label?: string
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null

  // Filter out null values and get relevant entries
  const validEntries = payload.filter(entry => entry.value !== null && entry.value !== undefined)
  if (validEntries.length === 0) return null

  // Determine the primary weight to display
  const historicalWeight = validEntries.find(e => e.dataKey === 'historical_weight')
  const projectedWeight = validEntries.find(e => e.dataKey === 'projected_weight')
  const optimisticWeight = validEntries.find(e => e.dataKey === 'optimistic_weight')
  const pessimisticWeight = validEntries.find(e => e.dataKey === 'pessimistic_weight')
  const regularWeight = validEntries.find(e => e.dataKey === 'weight')
  const averageWeight = validEntries.find(e => e.dataKey === 'average')

  // Check if this is projection data
  const isProjectionData = historicalWeight || projectedWeight || optimisticWeight || pessimisticWeight

  return (
    <div className="chart-tooltip">
      <p className="text-caption text-fog mb-1">{label}</p>

      {isProjectionData ? (
        <div className="space-y-0.5">
          {historicalWeight && (
            <p className="font-mono text-sm">
              <span className="text-fjord font-medium">{historicalWeight.value?.toFixed(1)} kg</span>
              <span className="text-stone text-xs ml-1">actual</span>
            </p>
          )}
          {projectedWeight && !historicalWeight && (
            <p className="font-mono text-sm">
              <span className="text-fjord/80 font-medium">{projectedWeight.value?.toFixed(1)} kg</span>
              <span className="text-stone text-xs ml-1">projected</span>
            </p>
          )}
          {optimisticWeight && pessimisticWeight && !historicalWeight && (
            <p className="font-mono text-xs text-stone">
              Range: {pessimisticWeight.value?.toFixed(1)} - {optimisticWeight.value?.toFixed(1)} kg
            </p>
          )}
        </div>
      ) : (
        <>
          {regularWeight && (
            <p className="font-mono text-sm">
              <span className="text-fjord">{regularWeight.value} kg</span>
            </p>
          )}
          {averageWeight && (
            <p className="font-mono text-sm">
              <span className="text-ember">{averageWeight.value} kg avg</span>
            </p>
          )}
        </>
      )}
    </div>
  )
}
