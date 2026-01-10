'use client'

import { useState, useEffect } from 'react'
import { Target } from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
} from 'recharts'
import type { Task } from '../../lib/types'

interface TaskChartProps {
  tasks: Task[]
  className?: string
}

export function TaskChart({
  tasks,
  className
}: TaskChartProps) {
  const [chartMounted, setChartMounted] = useState(false)

  useEffect(() => {
    setChartMounted(true)
  }, [])

  // Get completed tasks with their completion dates
  const completedTasks = tasks.filter(t => t.completed && t.completed_at)

  if (completedTasks.length < 2) {
    return (
      <div className={`weight-chart-empty h-full flex items-center justify-center ${className ?? ''}`}>
        <div className="flex flex-col items-center justify-center text-center p-6">
          <Target className="w-8 h-8 text-stone mb-3 opacity-50" />
          <p className="text-fog text-sm">Complete at least 2 tasks</p>
          <p className="text-stone text-xs mt-1">to see productivity trends</p>
        </div>
      </div>
    )
  }

  // Group tasks by completion date
  const tasksByDate: Record<string, number> = {}
  completedTasks.forEach(task => {
    const date = task.completed_at!.split('T')[0]
    tasksByDate[date!] = (tasksByDate[date!] || 0) + 1
  })

  // Get last 14 days
  const today = new Date()
  const chartData = []
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    chartData.push({
      date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      count: tasksByDate[dateStr!] || 0,
      fullDate: dateStr
    })
  }

  // Calculate category breakdown for completed tasks
  const categoryBreakdown: Record<string, number> = {}
  completedTasks.forEach(task => {
    const cat = task.category || 'uncategorized'
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1
  })

  const categoryColors: Record<string, string> = {
    work: '#F59E0B',
    personal: '#EC4899',
    health: '#10B981',
    finance: '#8B5CF6',
    errands: '#3B82F6',
    learning: '#06B6D4',
    uncategorized: '#6B7280'
  }

  return (
    <div className={`weight-chart h-full flex flex-col ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-ember" />
          <span className="text-caption text-fog">TASK COMPLETIONS</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {Object.entries(categoryBreakdown).slice(0, 3).map(([cat, count]) => (
            <span key={cat} className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: categoryColors[cat] || '#6B7280' }}
              />
              <span className="text-stone capitalize">{cat === 'uncategorized' ? 'Other' : cat}: {count}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="chart-container flex-1 min-h-0">
        {chartMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 10 }}
                interval="preserveStartEnd"
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 10 }}
                allowDecimals={false}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null
                  const data = payload[0]?.payload as { count: number } | undefined
                  return (
                    <div className="chart-tooltip">
                      <p className="text-caption text-fog mb-1">{label}</p>
                      <p className="font-mono text-sm text-ember">
                        {data?.count} {data?.count === 1 ? 'task' : 'tasks'} completed
                      </p>
                    </div>
                  )
                }}
              />

              <Bar
                dataKey="count"
                fill="#F97316"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
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
