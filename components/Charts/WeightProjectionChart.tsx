'use client'

import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
  ReferenceDot,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import { TimeframeSelector } from '../UI/TimeframeSelector'
import type { ProjectionDataPoint, ProjectionTimeframe } from '../../lib/types'

interface WeightEntry {
  id: string
  date: string
  weight: number
  created_at: string
}

interface WeightProjectionChartProps {
  weights: WeightEntry[]
  projectionData: ProjectionDataPoint[]
  goalWeight: number | null
  showConfidenceBands: boolean
  timeframe: ProjectionTimeframe
  onToggleBands: () => void
  onChangeTimeframe: (tf: ProjectionTimeframe) => void
  className?: string
}

export function WeightProjectionChart({
  weights,
  projectionData,
  goalWeight,
  showConfidenceBands,
  timeframe,
  onToggleBands,
  onChangeTimeframe,
  className = ''
}: WeightProjectionChartProps) {
  const [chartMounted, setChartMounted] = useState(false)

  useEffect(() => {
    setChartMounted(true)
  }, [])

  // Combine historical and projection data
  const chartData = useMemo(() => {
    if (!weights.length || !projectionData.length) return []

    // Sort historical weights
    const sortedWeights = [...weights].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Get starting TDEE and intake from first projection point
    const startingTDEE = projectionData[0]?.tdee ?? null
    const startingIntake = projectionData[0]?.target_intake ?? null

    // Get last 14 days of historical data
    const historicalData = sortedWeights.slice(-14).map(w => ({
      date: w.date,
      displayDate: new Date(w.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      historical_weight: w.weight,
      projected_weight: null as number | null,
      optimistic_weight: null as number | null,
      pessimistic_weight: null as number | null,
      is_milestone: false,
      milestone_label: undefined as string | undefined,
      tdee: startingTDEE, // Use starting TDEE for historical points
      target_intake: startingIntake
    }))

    // Add projection data (skip first point as it overlaps with current)
    const projectionPoints = projectionData.slice(1).map(p => ({
      date: p.date,
      displayDate: new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      historical_weight: null as number | null,
      projected_weight: p.projected_weight,
      optimistic_weight: p.optimistic_weight ?? null,
      pessimistic_weight: p.pessimistic_weight ?? null,
      is_milestone: p.is_milestone ?? false,
      milestone_label: p.milestone_label,
      tdee: p.tdee ?? null,
      target_intake: p.target_intake ?? null
    }))

    // Bridge point: last historical becomes first projection
    const lastHistorical = historicalData[historicalData.length - 1]
    if (lastHistorical) {
      lastHistorical.projected_weight = lastHistorical.historical_weight
      if (showConfidenceBands && projectionData[0]) {
        lastHistorical.optimistic_weight = lastHistorical.historical_weight
        lastHistorical.pessimistic_weight = lastHistorical.historical_weight
      }
    }

    // Limit projection points based on chart readability
    const maxProjectionPoints = timeframe === '1y' ? 52 : timeframe === '6m' ? 26 : 30
    const sampledProjection = projectionPoints.length > maxProjectionPoints
      ? projectionPoints.filter((_, i) => i % Math.ceil(projectionPoints.length / maxProjectionPoints) === 0)
      : projectionPoints

    return [...historicalData, ...sampledProjection]
  }, [weights, projectionData, timeframe, showConfidenceBands])

  // Find milestones for reference dots
  const milestones = useMemo(() => {
    return chartData.filter(d => d.is_milestone && d.milestone_label)
  }, [chartData])

  // Calculate Y-axis domain
  const [yMin, yMax] = useMemo(() => {
    const allValues = chartData.flatMap(d => [
      d.historical_weight,
      d.projected_weight,
      showConfidenceBands ? d.optimistic_weight : null,
      showConfidenceBands ? d.pessimistic_weight : null
    ]).filter((v): v is number => v !== null)

    if (goalWeight) allValues.push(goalWeight)

    if (allValues.length === 0) return [0, 100]

    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const padding = (max - min) * 0.15 || 2

    return [Math.floor(min - padding), Math.ceil(max + padding)]
  }, [chartData, goalWeight, showConfidenceBands])

  if (!weights.length || weights.length < 2) {
    return (
      <div className={`h-[200px] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <TrendingUp className="w-6 h-6 text-stone mb-2 mx-auto opacity-50" />
          <p className="text-fog text-sm">Log at least 2 weight entries to see projections</p>
        </div>
      </div>
    )
  }

  if (!projectionData.length) {
    return (
      <div className={`h-[200px] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <TrendingUp className="w-6 h-6 text-stone mb-2 mx-auto opacity-50" />
          <p className="text-fog text-sm">Unable to generate projection</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`weight-projection-chart ${className}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-0.5 bg-fjord rounded-full" />
            <span className="text-stone">Historical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-0.5 bg-fjord/50 rounded-full border-b border-dashed border-fjord" />
            <span className="text-stone">Projected</span>
          </div>
          {goalWeight && (
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-0.5 bg-moss rounded-full" />
              <span className="text-stone">Goal</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleBands}
            className={`
              flex items-center gap-1 px-2 py-1 text-[10px] rounded transition-all
              ${showConfidenceBands
                ? 'bg-fjord/20 text-fjord'
                : 'glass-recessed text-stone hover:text-fog'
              }
            `}
            title={showConfidenceBands ? 'Hide confidence bands' : 'Show confidence bands'}
          >
            {showConfidenceBands ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span className="hidden sm:inline">Bands</span>
          </button>
          <TimeframeSelector
            value={timeframe}
            onChange={onChangeTimeframe}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="h-[220px] sm:h-[260px]">
        {chartMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Historical gradient */}
                <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B8DEF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#5B8DEF" stopOpacity={0} />
                </linearGradient>
                {/* Projection gradient */}
                <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B8DEF" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#5B8DEF" stopOpacity={0} />
                </linearGradient>
                {/* Confidence band gradient */}
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B8DEF" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#5B8DEF" stopOpacity={0.05} />
                </linearGradient>
                {/* Nautical grid */}
                <pattern id="projectionGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
              </defs>

              <rect width="100%" height="100%" fill="url(#projectionGrid)" />

              <XAxis
                dataKey="displayDate"
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

              <Tooltip
                content={<ChartTooltip />}
              />

              {/* Goal reference line */}
              {goalWeight && (
                <ReferenceLine
                  y={goalWeight}
                  stroke="#7CB342"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  label={{
                    value: `Goal: ${goalWeight}kg`,
                    position: 'right',
                    fill: '#7CB342',
                    fontSize: 10
                  }}
                />
              )}

              {/* Confidence bands (pessimistic to optimistic area) */}
              {showConfidenceBands && (
                <>
                  <Area
                    type="monotone"
                    dataKey="optimistic_weight"
                    stroke="none"
                    fill="url(#confidenceGradient)"
                    connectNulls={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="pessimistic_weight"
                    stroke="none"
                    fill="url(#confidenceGradient)"
                    connectNulls={false}
                  />
                </>
              )}

              {/* Historical weight area */}
              <Area
                type="monotone"
                dataKey="historical_weight"
                stroke="none"
                fill="url(#historicalGradient)"
                connectNulls={false}
              />

              {/* Projection area */}
              <Area
                type="monotone"
                dataKey="projected_weight"
                stroke="none"
                fill="url(#projectionGradient)"
                connectNulls={false}
              />

              {/* Confidence band lines */}
              {showConfidenceBands && (
                <>
                  <Line
                    type="monotone"
                    dataKey="optimistic_weight"
                    stroke="#5B8DEF"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                    dot={false}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="pessimistic_weight"
                    stroke="#5B8DEF"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                    dot={false}
                    connectNulls={false}
                  />
                </>
              )}

              {/* Historical weight line */}
              <Line
                type="monotone"
                dataKey="historical_weight"
                stroke="#5B8DEF"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#1C1C1E', stroke: '#5B8DEF', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#5B8DEF', stroke: '#1C1C1E', strokeWidth: 2 }}
                connectNulls={false}
              />

              {/* Projected weight line */}
              <Line
                type="monotone"
                dataKey="projected_weight"
                stroke="#5B8DEF"
                strokeWidth={2}
                strokeDasharray="8 4"
                strokeOpacity={0.7}
                dot={false}
                activeDot={{ r: 4, fill: '#5B8DEF', stroke: '#1C1C1E', strokeWidth: 2 }}
                connectNulls={false}
              />

              {/* Milestone markers */}
              {milestones.map((milestone, index) => (
                <ReferenceDot
                  key={`milestone-${index}`}
                  x={milestone.displayDate}
                  y={milestone.projected_weight!}
                  r={6}
                  fill="#F97316"
                  stroke="#1C1C1E"
                  strokeWidth={2}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-stone text-sm">Loading chart...</div>
          </div>
        )}
      </div>

      {/* Milestone labels */}
      {milestones.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {milestones.map((milestone, index) => (
            <div
              key={`label-${index}`}
              className="flex items-center gap-1 text-[10px] bg-ember/20 text-ember px-2 py-1 rounded"
            >
              <span>{milestone.milestone_label}</span>
              <span className="text-ember/70">
                {new Date(milestone.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
