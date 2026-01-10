'use client'

import { useState, useEffect } from 'react'
import { CheckSquare } from 'lucide-react'
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
import type { HabitLog, Habit } from '../../lib/types'

interface HabitChartProps {
  habitLogs: HabitLog[]
  habits: Habit[]
  className?: string
  onLoadSample?: () => void
}

export function HabitChart({
  habitLogs,
  habits,
  className,
  onLoadSample
}: HabitChartProps) {
  const [chartMounted, setChartMounted] = useState(false)

  useEffect(() => {
    setChartMounted(true)
  }, [])

  const activeHabits = habits.filter(h => h.active)

  // Get unique dates with habit data
  const uniqueDates = [...new Set(habitLogs.map(l => l.date))].sort()

  if (uniqueDates.length < 2 || activeHabits.length === 0) {
    return (
      <div className={`weight-chart-empty h-full flex items-center justify-center ${className ?? ''}`}>
        <div className="flex flex-col items-center justify-center text-center p-6">
          <CheckSquare className="w-8 h-8 text-stone mb-3 opacity-50" />
          <p className="text-fog text-sm">Track habits for at least 2 days</p>
          <p className="text-stone text-xs mt-1">to see completion trends</p>
          {onLoadSample && (
            <button
              onClick={onLoadSample}
              className="mt-3 text-xs text-victory-green hover:text-bone transition-colors underline underline-offset-2"
            >
              Load sample data
            </button>
          )}
        </div>
      </div>
    )
  }

  // Calculate completion rate per day
  const chartData = uniqueDates.slice(-30).map(date => {
    const dayLogs = habitLogs.filter(l => l.date === date)
    const completed = dayLogs.filter(l => l.completed).length
    const rate = activeHabits.length > 0 ? Math.round((completed / activeHabits.length) * 100) : 0

    return {
      date: new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      rate,
      completed,
      total: activeHabits.length,
      fullDate: date
    }
  })

  return (
    <div className={`weight-chart h-full flex flex-col ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-victory-green" />
          <span className="text-caption text-fog">HABIT COMPLETION</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone">Completion %</span>
        </div>
      </div>

      <div className="chart-container flex-1 min-h-0">
        {chartMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="habitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
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
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null
                  const data = payload[0]?.payload as { rate: number; completed: number; total: number } | undefined
                  return (
                    <div className="chart-tooltip">
                      <p className="text-caption text-fog mb-1">{label}</p>
                      <p className="font-mono text-sm text-victory-green">
                        {data?.rate}% ({data?.completed}/{data?.total})
                      </p>
                    </div>
                  )
                }}
              />

              <ReferenceLine
                y={100}
                stroke="#4ADE80"
                strokeDasharray="6 4"
                strokeWidth={1}
                opacity={0.3}
              />

              <Area
                type="monotone"
                dataKey="rate"
                stroke="none"
                fill="url(#habitGradient)"
              />

              <Line
                type="monotone"
                dataKey="rate"
                stroke="#4ADE80"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#1C1C1E', stroke: '#4ADE80', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#4ADE80', stroke: '#1C1C1E', strokeWidth: 2 }}
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
