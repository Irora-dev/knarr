'use client'

interface PayloadEntry {
  value: number | null
  dataKey: string
  name?: string
  payload?: Record<string, unknown>
}

interface ChartTooltipProps {
  active?: boolean
  payload?: PayloadEntry[]
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

  // Get TDEE and target intake from the data point payload (available on projection points)
  const tdeeValue = validEntries[0]?.payload?.tdee as number | undefined
  const targetIntakeValue = validEntries[0]?.payload?.target_intake as number | undefined
  const leanMassEstimate = validEntries[0]?.payload?.lean_mass_estimate as number | undefined
  const fatMassEstimate = validEntries[0]?.payload?.fat_mass_estimate as number | undefined

  // Check if this is projection data
  const isProjectionData = historicalWeight || projectedWeight || optimisticWeight || pessimisticWeight
  const hasBodyComposition = leanMassEstimate !== undefined && fatMassEstimate !== undefined

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
          {!historicalWeight && (tdeeValue || targetIntakeValue || hasBodyComposition) && (
            <div className="mt-1 pt-1 border-t border-white/10">
              {tdeeValue && (
                <p className="font-mono text-xs text-ember">
                  TDEE: {tdeeValue.toLocaleString()} kcal
                </p>
              )}
              {targetIntakeValue && (
                <p className="font-mono text-xs text-moss">
                  Target: {targetIntakeValue.toLocaleString()} kcal
                </p>
              )}
              {hasBodyComposition && (
                <div className="mt-1 pt-1 border-t border-white/10">
                  <p className="font-mono text-xs text-fjord">
                    +{leanMassEstimate?.toFixed(2)} kg lean
                  </p>
                  <p className="font-mono text-xs text-stone">
                    +{fatMassEstimate?.toFixed(2)} kg fat
                  </p>
                </div>
              )}
            </div>
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
