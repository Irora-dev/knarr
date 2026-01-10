'use client'

import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts'
import type { CalorieLog } from '../../lib/types'

interface CalorieChartProps {
  calories: CalorieLog[]
  goal: number | null
  className?: string
  onLoadSample?: () => void
}

export function CalorieChart({
  calories,
  goal,
  className,
  onLoadSample
}: CalorieChartProps) {
  const [chartMounted, setChartMounted] = useState(false)

  useEffect(() => {
    setChartMounted(true)
  }, [])

  if (!calories || calories.length < 2) {
    return (
      <div className={`weight-chart-empty h-full flex items-center justify-center ${className ?? ''}`}>
        <div className="flex flex-col items-center justify-center text-center p-6">
          <Flame className="w-8 h-8 text-stone mb-3 opacity-50" />
          <p className="text-fog text-sm">Log at least 2 days of calories</p>
          <p className="text-stone text-xs mt-1">to see your intake trends</p>
          {onLoadSample && (
            <button
              onClick={onLoadSample}
              className="mt-3 text-xs text-ember hover:text-bone transition-colors underline underline-offset-2"
            >
              Load sample data
            </button>
          )}
        </div>
      </div>
    )
  }

  // Sort calories by date and prepare chart data
  const sortedCalories = [...calories].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const chartData = sortedCalories.map((entry, index) => {
    // Calculate 7-day rolling average
    const windowStart = Math.max(0, index - 6)
    const window = sortedCalories.slice(windowStart, index + 1)
    const avg = window.reduce((sum, c) => sum + c.calories, 0) / window.length

    return {
      date: new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      calories: entry.calories,
      average: Math.round(avg),
      fullDate: entry.date
    }
  })

  const displayData = chartData.slice(-30)

  // Calculate Y-axis domain with padding
  const allValues = displayData.flatMap(d => [d.calories, d.average])
  if (goal) allValues.push(goal)
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
  const padding = (maxVal - minVal) * 0.15 || 200
  const yMin = Math.floor((minVal - padding) / 100) * 100
  const yMax = Math.ceil((maxVal + padding) / 100) * 100

  return (
    <div className={`weight-chart h-full flex flex-col ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-ember" />
          <span className="text-caption text-fog">CALORIE LOG</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-ember rounded-full" />
            <span className="text-stone">Daily</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-fjord rounded-full" />
            <span className="text-stone">7-day Avg</span>
          </div>
          {goal && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-victory-green/50 rounded-full border-t border-dashed border-victory-green" />
              <span className="text-stone">Goal</span>
            </div>
          )}
        </div>
      </div>

      <div className="chart-container flex-1 min-h-0">
        {chartMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E07A3B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#E07A3B" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

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
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null
                  return (
                    <div className="chart-tooltip">
                      <p className="text-caption text-fog mb-1">{label}</p>
                      {payload.map((entry, index) => (
                        <p key={index} className="font-mono text-sm">
                          {entry.dataKey === 'calories' && (
                            <span className="text-ember">{entry.value} kcal</span>
                          )}
                          {entry.dataKey === 'average' && (
                            <span className="text-fjord">{entry.value} avg</span>
                          )}
                        </p>
                      ))}
                    </div>
                  )
                }}
              />

              {goal && (
                <ReferenceLine
                  y={goal}
                  stroke="#4ADE80"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  opacity={0.6}
                />
              )}

              <Area
                type="monotone"
                dataKey="calories"
                stroke="none"
                fill="url(#calorieGradient)"
              />

              <Line
                type="monotone"
                dataKey="average"
                stroke="#5B8DEF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#5B8DEF', stroke: '#1C1C1E', strokeWidth: 2 }}
              />

              <Line
                type="monotone"
                dataKey="calories"
                stroke="#E07A3B"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#1C1C1E', stroke: '#E07A3B', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#E07A3B', stroke: '#1C1C1E', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center">
            <div className="text-stone text-sm">Loading chart...</div>
          </div>
        )}
      </div>
    </div>
  )
}
