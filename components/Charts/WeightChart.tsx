'use client'

import { useState, useEffect } from 'react'
import { Navigation, Plus } from 'lucide-react'
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import type { WeightEntry } from '../../lib/types'

interface WeightChartProps {
  weights: WeightEntry[]
  goal: number | null
  className?: string
  onLoadSample?: () => void
  onLogWeight?: () => void
}

export function WeightChart({
  weights,
  goal,
  className,
  onLoadSample,
  onLogWeight
}: WeightChartProps) {
  const [chartMounted, setChartMounted] = useState(false)

  useEffect(() => {
    setChartMounted(true)
  }, [])

  if (!weights || weights.length < 2) {
    return (
      <div className={`weight-chart-empty h-full flex items-center justify-center ${className ?? ''}`}>
        <div className="flex flex-col items-center justify-center text-center p-4">
          <Navigation className="w-6 h-6 text-stone mb-2 opacity-50" />
          <p className="text-fog text-sm">Log at least 2 weight entries</p>
          {onLoadSample && (
            <button
              onClick={onLoadSample}
              className="mt-2 text-xs text-fjord hover:text-bone transition-colors underline underline-offset-2"
            >
              Load sample data
            </button>
          )}
        </div>
      </div>
    )
  }

  // Sort weights by date and prepare chart data
  const sortedWeights = [...weights].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Calculate rolling average for each point
  const chartData = sortedWeights.map((entry, index) => {
    const windowStart = Math.max(0, index - 6)
    const window = sortedWeights.slice(windowStart, index + 1)
    const avg = window.reduce((sum, w) => sum + w.weight, 0) / window.length

    return {
      date: new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      weight: entry.weight,
      average: Math.round(avg * 10) / 10,
      fullDate: entry.date
    }
  })

  // Get last 30 entries max for display
  const displayData = chartData.slice(-30)

  // Calculate Y-axis domain with padding
  const allValues = displayData.flatMap(d => [d.weight, d.average])
  if (goal) allValues.push(goal)
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
  const padding = (maxVal - minVal) * 0.15 || 2
  const yMin = Math.floor(minVal - padding)
  const yMax = Math.ceil(maxVal + padding)

  return (
    <div className={`weight-chart h-full flex flex-col ${className ?? ''}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-fjord" />
          <span className="text-[10px] text-fog uppercase">Weight</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-0.5 bg-fjord rounded-full" />
            <span className="text-stone">Weight</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-0.5 bg-stone/60 rounded-full" />
            <span className="text-stone">Avg</span>
          </div>
          {onLogWeight && (
            <button
              onClick={onLogWeight}
              className="ml-2 px-2 py-1 rounded bg-fjord/20 text-fjord hover:bg-fjord/30 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container flex-1 min-h-0">
        {chartMounted ? (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {/* Nautical grid pattern */}
            <defs>
              <pattern id="nauticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5B8DEF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#5B8DEF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="averageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9CA3AF" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#9CA3AF" stopOpacity={0} />
              </linearGradient>
              {/* Wave pattern for decoration */}
              <pattern id="wavePattern" width="100" height="10" patternUnits="userSpaceOnUse">
                <path
                  d="M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5"
                  fill="none"
                  stroke="rgba(91, 141, 239, 0.1)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>

            {/* Background */}
            <rect width="100%" height="100%" fill="url(#nauticalGrid)" />


            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 10 }}
              interval="preserveStartEnd"
            />

            <YAxis
              domain={[yMin, yMax]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 10 }}
              tickFormatter={(value) => `${value}`}
            />

            <Tooltip content={<ChartTooltip />} />


            {/* Area under weight line */}
            <Area
              type="monotone"
              dataKey="weight"
              stroke="none"
              fill="url(#weightGradient)"
            />

            {/* Average line */}
            <Line
              type="monotone"
              dataKey="average"
              stroke="#9CA3AF"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: '#9CA3AF', stroke: '#1C1C1E', strokeWidth: 2 }}
            />

            {/* Weight line */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#5B8DEF"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#1C1C1E', stroke: '#5B8DEF', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#5B8DEF', stroke: '#1C1C1E', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-stone text-sm">Loading chart...</div>
          </div>
        )}

        {/* Decorative wave at bottom */}
        <div className="chart-wave-decoration" />
      </div>
    </div>
  )
}
