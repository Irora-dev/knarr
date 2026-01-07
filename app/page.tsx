'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass as CompassIcon,
  Flame,
  CheckSquare,
  Target,
  Plus,
  X,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  Mail,
  Anchor,
  Goal,
  ArrowRight,
  Navigation,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  PenLine,
  Star,
  Heart,
  Briefcase,
  Users,
  Brain,
  DollarSign,
  Flag,
  Trophy,
  LogOut
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { AuthScreen } from '../components/AuthScreen'
import { OnboardingFlow } from '../components/OnboardingFlow'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts'

// Types
interface CalorieLog {
  id: string
  date: string
  calories: number
  created_at: string
}

interface WeightEntry {
  id: string
  date: string
  weight: number
  created_at: string
}

interface Habit {
  id: string
  name: string
  active: boolean
}

interface HabitLog {
  id: string
  habit_id: string
  date: string
  completed: boolean
}

interface Heading {
  id: string
  date: string
  intention: string
  completed: boolean
}

interface Message {
  id: string
  content: string
  created_at: string
  deliver_at: string
  read: boolean
  mood?: 'hopeful' | 'grateful' | 'determined' | 'reflective'
}

interface Bearing {
  id: string
  type: 'weekly' | 'monthly'
  period_start: string // Start of the week/month
  period_end: string   // End of the week/month
  wins: string[]       // What went well
  challenges: string[] // What was difficult
  lessons: string      // What you learned
  focus: string        // Focus for next period
  created_at: string
}

interface LifeGoal {
  id: string
  category: 'health' | 'career' | 'relationships' | 'growth' | 'financial' | 'other'
  title: string
  description: string
  why: string // Why this matters
  target_date?: string
  progress: number // 0-100
  created_at: string
}

interface Waypoint {
  id: string
  title: string
  description?: string
  achieved_date: string
  goal_id?: string // Optional link to a life goal
  created_at: string
}

// Helper functions
const getTodayString = (): string => {
  const date = new Date().toISOString().split('T')[0]
  return date ?? ''
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

const formatShortDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

const getDateOffset = (offset: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().split('T')[0] ?? ''
}

// Get week start (Monday) and end (Sunday) for a given date
const getWeekBounds = (date: Date): { start: string; end: string } => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  const start = new Date(d.setDate(diff))
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return {
    start: start.toISOString().split('T')[0] ?? '',
    end: end.toISOString().split('T')[0] ?? ''
  }
}

// Get month start and end for a given date
const getMonthBounds = (date: Date): { start: string; end: string } => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return {
    start: start.toISOString().split('T')[0] ?? '',
    end: end.toISOString().split('T')[0] ?? ''
  }
}

const formatPeriod = (start: string, end: string, type: 'weekly' | 'monthly') => {
  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')

  if (type === 'monthly') {
    return startDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  }

  return `${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
}

// Local Storage helpers
const STORAGE_KEYS = {
  calories: 'knarr_calories',
  weights: 'knarr_weights',
  habits: 'knarr_habits',
  habitLogs: 'knarr_habit_logs',
  headings: 'knarr_headings',
  userName: 'knarr_user_name',
  weightGoal: 'knarr_weight_goal',
  calorieGoal: 'knarr_calorie_goal',
  messages: 'knarr_messages',
  bearings: 'knarr_bearings',
  lifeGoals: 'knarr_life_goals',
  waypoints: 'knarr_waypoints',
  onboardingComplete: 'knarr_onboarding_complete',
}

// Weight analysis helpers
function calculateRollingAverage(weights: WeightEntry[], days: number): number | null {
  if (weights.length === 0) return null

  const sortedWeights = [...weights].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const recentWeights = sortedWeights.slice(0, days)
  if (recentWeights.length === 0) return null

  const sum = recentWeights.reduce((acc, w) => acc + w.weight, 0)
  return Math.round((sum / recentWeights.length) * 10) / 10
}

function calculateTrend(weights: WeightEntry[]): 'up' | 'down' | 'stable' | null {
  if (weights.length < 3) return null

  const sortedWeights = [...weights].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Compare last 3 entries average to previous 3 entries
  const recent = sortedWeights.slice(0, 3)
  const previous = sortedWeights.slice(3, 6)

  if (previous.length === 0) return null

  const recentAvg = recent.reduce((acc, w) => acc + w.weight, 0) / recent.length
  const previousAvg = previous.reduce((acc, w) => acc + w.weight, 0) / previous.length

  const diff = recentAvg - previousAvg

  if (Math.abs(diff) < 0.3) return 'stable'
  return diff > 0 ? 'up' : 'down'
}

function getProgressToGoal(current: number, goal: number, start?: number): number {
  // If we don't have a start weight, assume they started 10kg away from goal
  const startWeight = start ?? (goal > current ? current + 10 : current - 10)
  const totalDistance = Math.abs(startWeight - goal)
  const currentDistance = Math.abs(current - goal)
  const progress = ((totalDistance - currentDistance) / totalDistance) * 100
  return Math.max(0, Math.min(100, progress))
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : defaultValue
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// Compass Rose SVG Component
function CompassRose({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle */}
      <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />

      {/* Cardinal directions - main points */}
      <path d="M100 5 L108 100 L100 85 L92 100 Z" fill="currentColor" opacity="0.6" /> {/* N */}
      <path d="M195 100 L100 108 L115 100 L100 92 Z" fill="currentColor" opacity="0.4" /> {/* E */}
      <path d="M100 195 L92 100 L100 115 L108 100 Z" fill="currentColor" opacity="0.4" /> {/* S */}
      <path d="M5 100 L100 92 L85 100 L100 108 Z" fill="currentColor" opacity="0.4" /> {/* W */}

      {/* Intercardinal directions */}
      <path d="M165 35 L108 92 L100 100 L92 92 Z" fill="currentColor" opacity="0.2" /> {/* NE */}
      <path d="M165 165 L108 108 L100 100 L108 92 Z" fill="currentColor" opacity="0.2" /> {/* SE */}
      <path d="M35 165 L92 108 L100 100 L108 108 Z" fill="currentColor" opacity="0.2" /> {/* SW */}
      <path d="M35 35 L92 92 L100 100 L92 108 Z" fill="currentColor" opacity="0.2" /> {/* NW */}

      {/* Center circle */}
      <circle cx="100" cy="100" r="8" fill="currentColor" opacity="0.3" />
      <circle cx="100" cy="100" r="4" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

// Streak Display Component
function StreakDisplay({ count, label }: { count: number; label: string }) {
  const marks = Array.from({ length: Math.min(count, 14) }, (_, i) => i)

  return (
    <div className="streak-container">
      <div className="streak-marks">
        {marks.map((_, i) => (
          <div
            key={i}
            className={`streak-mark ${i === marks.length - 1 ? 'current' : 'complete'}`}
          />
        ))}
      </div>
      {count > 14 && (
        <span className="text-caption text-fog">+{count - 14}</span>
      )}
      <span className="text-caption text-fog">{label}</span>
    </div>
  )
}

// Trend Arrow Component
function TrendArrow({ trend, goalDirection }: { trend: 'up' | 'down' | 'stable' | null; goalDirection?: 'up' | 'down' }) {
  if (!trend) return null

  const isGood = goalDirection ? trend === goalDirection : trend === 'down'
  const colorClass = trend === 'stable' ? 'text-fog' : isGood ? 'text-victory-green' : 'text-blood-red'

  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      {trend === 'up' && <TrendingUp className="w-4 h-4" />}
      {trend === 'down' && <TrendingDown className="w-4 h-4" />}
      {trend === 'stable' && <Minus className="w-4 h-4" />}
      <span className="text-xs font-medium uppercase">
        {trend === 'stable' ? 'Stable' : trend === 'up' ? 'Up' : 'Down'}
      </span>
    </div>
  )
}

// Custom Tooltip for Chart
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
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

// Weight Chart Component with Nautical Design
function WeightChart({
  weights,
  goal,
  className,
  onLoadSample,
  onLogWeight
}: {
  weights: WeightEntry[]
  goal: number | null
  className?: string
  onLoadSample?: () => void
  onLogWeight?: () => void
}) {
  const [chartMounted, setChartMounted] = useState(false)

  useEffect(() => {
    setChartMounted(true)
  }, [])

  if (!weights || weights.length < 2) {
    return (
      <div className={`weight-chart-empty min-h-[160px] flex items-center justify-center ${className ?? ''}`}>
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
    <div className={`weight-chart ${className ?? ''}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-2">
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
      <div className="chart-container">
        {chartMounted ? (
        <ResponsiveContainer width="100%" height={150}>
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

// Calorie Chart Component
function CalorieChart({
  calories,
  goal,
  className
}: {
  calories: CalorieLog[]
  goal: number | null
  className?: string
}) {
  const [chartMounted, setChartMounted] = useState(false)

  useEffect(() => {
    setChartMounted(true)
  }, [])

  if (!calories || calories.length < 2) {
    return (
      <div className={`weight-chart-empty min-h-[200px] flex items-center justify-center ${className ?? ''}`}>
        <div className="flex flex-col items-center justify-center text-center p-6">
          <Flame className="w-8 h-8 text-stone mb-3 opacity-50" />
          <p className="text-fog text-sm">Log at least 2 days of calories</p>
          <p className="text-stone text-xs mt-1">to see your intake trends</p>
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
    <div className={`weight-chart ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-4">
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

      <div className="chart-container">
        {chartMounted ? (
          <ResponsiveContainer width="100%" height={180}>
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

// Insights/Correlations Component
function InsightsCard({
  calories,
  weights,
  habitLogs,
  habits,
  calorieGoal
}: {
  calories: CalorieLog[]
  weights: WeightEntry[]
  habitLogs: HabitLog[]
  habits: Habit[]
  calorieGoal: number | null
}) {
  // Calculate insights only if we have enough data
  const insights: { icon: string; text: string; type: 'positive' | 'neutral' | 'negative' }[] = []

  const activeHabits = habits.filter(h => h.active)

  // Sort data by date
  const sortedWeights = [...weights].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const sortedCalories = [...calories].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // 1. Weight trend insight
  if (sortedWeights.length >= 7) {
    const recentWeek = sortedWeights.slice(0, 7)
    const avgRecent = recentWeek.reduce((sum, w) => sum + w.weight, 0) / recentWeek.length

    if (sortedWeights.length >= 14) {
      const previousWeek = sortedWeights.slice(7, 14)
      const avgPrevious = previousWeek.reduce((sum, w) => sum + w.weight, 0) / previousWeek.length
      const diff = avgRecent - avgPrevious

      if (Math.abs(diff) >= 0.3) {
        insights.push({
          icon: diff < 0 ? '📉' : '📈',
          text: `Weight ${diff < 0 ? 'down' : 'up'} ${Math.abs(diff).toFixed(1)}kg vs last week`,
          type: diff < 0 ? 'positive' : 'neutral'
        })
      }
    }
  }

  // 2. Calorie consistency insight
  if (sortedCalories.length >= 5 && calorieGoal) {
    const recent = sortedCalories.slice(0, 7)
    const daysOnTarget = recent.filter(c =>
      Math.abs(c.calories - calorieGoal) <= calorieGoal * 0.1 // Within 10% of goal
    ).length

    if (daysOnTarget >= 5) {
      insights.push({
        icon: '🎯',
        text: `${daysOnTarget}/7 days within calorie target this week`,
        type: 'positive'
      })
    } else if (daysOnTarget <= 2) {
      insights.push({
        icon: '⚠️',
        text: `Only ${daysOnTarget}/7 days on calorie target`,
        type: 'negative'
      })
    }
  }

  // 3. Habit completion correlation with weight
  if (habitLogs.length >= 14 && sortedWeights.length >= 7 && activeHabits.length > 0) {
    // Get days with high habit completion (>= 80%)
    const uniqueDates = [...new Set(habitLogs.map(l => l.date))].sort().slice(-14)
    const highCompletionDays = uniqueDates.filter(date => {
      const dayLogs = habitLogs.filter(l => l.date === date && l.completed)
      return dayLogs.length >= activeHabits.length * 0.8
    })

    if (highCompletionDays.length >= 10) {
      insights.push({
        icon: '🔥',
        text: 'Strong habit consistency - 80%+ completion most days',
        type: 'positive'
      })
    }
  }

  // 4. Calorie-weight correlation
  if (sortedCalories.length >= 14 && sortedWeights.length >= 7) {
    const avgCalories = sortedCalories.slice(0, 14).reduce((sum, c) => sum + c.calories, 0) / 14
    const weightTrend = sortedWeights.length >= 2
      ? sortedWeights[0]!.weight - sortedWeights[sortedWeights.length > 6 ? 6 : sortedWeights.length - 1]!.weight
      : 0

    if (calorieGoal) {
      if (avgCalories < calorieGoal * 0.9 && weightTrend < -0.3) {
        insights.push({
          icon: '💡',
          text: 'Calorie deficit correlating with weight loss',
          type: 'positive'
        })
      } else if (avgCalories > calorieGoal * 1.1 && weightTrend > 0.3) {
        insights.push({
          icon: '⚡',
          text: 'Higher calories may be affecting weight trend',
          type: 'neutral'
        })
      }
    }
  }

  // 5. Streak encouragement
  const uniqueCalorieDates = new Set(calories.map(c => c.date))
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]
    if (uniqueCalorieDates.has(dateStr!)) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  if (streak >= 7) {
    insights.push({
      icon: '🏆',
      text: `${streak} day logging streak! Keep it up!`,
      type: 'positive'
    })
  }

  // 6. Weekend pattern (if we have enough data)
  if (sortedCalories.length >= 14 && calorieGoal) {
    const weekendCalories = sortedCalories.filter(c => {
      const day = new Date(c.date + 'T00:00:00').getDay()
      return day === 0 || day === 6
    }).slice(0, 4)
    const weekdayCalories = sortedCalories.filter(c => {
      const day = new Date(c.date + 'T00:00:00').getDay()
      return day !== 0 && day !== 6
    }).slice(0, 10)

    if (weekendCalories.length >= 2 && weekdayCalories.length >= 5) {
      const avgWeekend = weekendCalories.reduce((sum, c) => sum + c.calories, 0) / weekendCalories.length
      const avgWeekday = weekdayCalories.reduce((sum, c) => sum + c.calories, 0) / weekdayCalories.length

      if (avgWeekend > avgWeekday * 1.15) {
        insights.push({
          icon: '📅',
          text: 'Weekend calories tend to be higher than weekdays',
          type: 'neutral'
        })
      }
    }
  }

  if (insights.length === 0) {
    return (
      <div className="glass-recessed p-4 rounded-lg text-center">
        <p className="text-fog text-sm">
          Keep logging for a few days to see insights about your patterns.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {insights.slice(0, 4).map((insight, index) => (
        <motion.div
          key={index}
          className={`glass-recessed p-3 rounded-lg flex items-start gap-3 ${
            insight.type === 'positive' ? 'border-l-2 border-victory-green' :
            insight.type === 'negative' ? 'border-l-2 border-blood-red' :
            'border-l-2 border-fjord'
          }`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <span className="text-lg">{insight.icon}</span>
          <p className="text-fog text-sm leading-relaxed">{insight.text}</p>
        </motion.div>
      ))}
    </div>
  )
}

// Habit Chart Component
function HabitChart({
  habitLogs,
  habits,
  className
}: {
  habitLogs: HabitLog[]
  habits: Habit[]
  className?: string
}) {
  const [chartMounted, setChartMounted] = useState(false)

  useEffect(() => {
    setChartMounted(true)
  }, [])

  const activeHabits = habits.filter(h => h.active)

  // Get unique dates with habit data
  const uniqueDates = [...new Set(habitLogs.map(l => l.date))].sort()

  if (uniqueDates.length < 2 || activeHabits.length === 0) {
    return (
      <div className={`weight-chart-empty min-h-[200px] flex items-center justify-center ${className ?? ''}`}>
        <div className="flex flex-col items-center justify-center text-center p-6">
          <CheckSquare className="w-8 h-8 text-stone mb-3 opacity-50" />
          <p className="text-fog text-sm">Track habits for at least 2 days</p>
          <p className="text-stone text-xs mt-1">to see completion trends</p>
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
    <div className={`weight-chart ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-victory-green" />
          <span className="text-caption text-fog">HABIT COMPLETION</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone">Completion %</span>
        </div>
      </div>

      <div className="chart-container">
        {chartMounted ? (
          <ResponsiveContainer width="100%" height={180}>
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

// Weight Goal Modal Component
function WeightGoalModal({
  isOpen,
  onClose,
  currentGoal,
  onSubmit
}: {
  isOpen: boolean
  onClose: () => void
  currentGoal: number | null
  onSubmit: (goal: number) => void
}) {
  const [value, setValue] = useState(currentGoal?.toString() ?? '')

  useEffect(() => {
    if (isOpen) {
      setValue(currentGoal?.toString() ?? '')
    }
  }, [isOpen, currentGoal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const goal = parseFloat(value)
    if (!isNaN(goal) && goal > 0) {
      onSubmit(goal)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-8 w-full max-w-md relative z-10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-fjord/20 flex items-center justify-center">
                  <Goal className="w-5 h-5 text-fjord" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Set Weight Goal</h2>
                  <p className="text-fog text-sm">Your True North</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  step="0.1"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. 80.0"
                  className="input flex-1 text-lg"
                  autoFocus
                />
                <span className="text-fog text-body-md font-mono">kg</span>
              </div>

              <p className="text-stone text-sm mt-3">
                This is your target weight. We'll track your progress toward this goal.
              </p>

              <button type="submit" className="btn-primary w-full mt-6">
                Set Goal
              </button>

              {currentGoal && (
                <button
                  type="button"
                  onClick={() => {
                    onSubmit(0) // 0 means clear goal
                    onClose()
                  }}
                  className="w-full mt-3 text-stone hover:text-fog text-sm transition-colors"
                >
                  Clear Goal
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Calorie Goal Modal Component
function CalorieGoalModal({
  isOpen,
  onClose,
  currentGoal,
  onSubmit
}: {
  isOpen: boolean
  onClose: () => void
  currentGoal: number | null
  onSubmit: (goal: number) => void
}) {
  const [value, setValue] = useState(currentGoal?.toString() ?? '')

  useEffect(() => {
    if (isOpen) {
      setValue(currentGoal?.toString() ?? '')
    }
  }, [isOpen, currentGoal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const goal = parseInt(value)
    if (!isNaN(goal) && goal > 0) {
      onSubmit(goal)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-8 w-full max-w-md relative z-10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ember/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-ember" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Daily Calorie Goal</h2>
                  <p className="text-fog text-sm">Set your daily target</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  step="50"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. 2000"
                  className="input flex-1 text-lg"
                  autoFocus
                />
                <span className="text-fog text-body-md font-mono">kcal</span>
              </div>

              <p className="text-stone text-sm mt-3">
                This is your target daily calorie intake. We'll show your progress toward this goal.
              </p>

              <button type="submit" className="btn-primary w-full mt-6">
                Set Goal
              </button>

              {currentGoal && (
                <button
                  type="button"
                  onClick={() => {
                    onSubmit(0)
                    onClose()
                  }}
                  className="w-full mt-3 text-stone hover:text-fog text-sm transition-colors"
                >
                  Clear Goal
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Write Message Modal Component
function WriteMessageModal({
  isOpen,
  onClose,
  onSubmit
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (message: Omit<Message, 'id' | 'read'>) => void
}) {
  const [content, setContent] = useState('')
  const [deliverIn, setDeliverIn] = useState('7') // days
  const [mood, setMood] = useState<Message['mood']>('hopeful')

  const moods: { value: Message['mood']; label: string; emoji: string }[] = [
    { value: 'hopeful', label: 'Hopeful', emoji: '🌅' },
    { value: 'grateful', label: 'Grateful', emoji: '🙏' },
    { value: 'determined', label: 'Determined', emoji: '⚔️' },
    { value: 'reflective', label: 'Reflective', emoji: '🌊' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      const deliverDate = new Date()
      deliverDate.setDate(deliverDate.getDate() + parseInt(deliverIn))
      onSubmit({
        content: content.trim(),
        created_at: new Date().toISOString(),
        deliver_at: deliverDate.toISOString().split('T')[0]!,
        mood,
      })
      setContent('')
      setDeliverIn('7')
      setMood('hopeful')
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-8 w-full max-w-lg relative z-10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-fjord/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-fjord" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Message in a Bottle</h2>
                  <p className="text-fog text-sm">Write to your future self</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Dear future me..."
                className="input w-full h-32 resize-none mb-4"
                autoFocus
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="stat-label block mb-2">Deliver in</label>
                  <select
                    value={deliverIn}
                    onChange={(e) => setDeliverIn(e.target.value)}
                    className="input w-full"
                  >
                    <option value="1">Tomorrow</option>
                    <option value="7">1 week</option>
                    <option value="14">2 weeks</option>
                    <option value="30">1 month</option>
                    <option value="90">3 months</option>
                    <option value="180">6 months</option>
                    <option value="365">1 year</option>
                  </select>
                </div>
                <div>
                  <label className="stat-label block mb-2">Mood</label>
                  <div className="flex gap-2">
                    {moods.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMood(m.value)}
                        className={`flex-1 p-2 rounded-lg text-center transition-all ${
                          mood === m.value
                            ? 'bg-fjord/30 border border-fjord/50'
                            : 'glass-recessed hover:bg-iron-slate/50'
                        }`}
                        title={m.label}
                      >
                        <span className="text-lg">{m.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                Cast into the Sea
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Message Card Component
function MessageCard({
  message,
  onMarkRead
}: {
  message: Message
  onMarkRead: (id: string) => void
}) {
  const moodEmojis: Record<string, string> = {
    hopeful: '🌅',
    grateful: '🙏',
    determined: '⚔️',
    reflective: '🌊',
  }

  const createdDate = new Date(message.created_at)
  const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <motion.div
      className={`glass-recessed p-4 rounded-lg ${!message.read ? 'border border-fjord/30' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{message.mood ? moodEmojis[message.mood] : '📜'}</span>
          <span className="text-caption text-stone">
            {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
          </span>
        </div>
        {!message.read && (
          <span className="text-xs bg-fjord/30 text-fjord px-2 py-0.5 rounded-full">New</span>
        )}
      </div>
      <p className="text-fog text-sm leading-relaxed mb-3">{message.content}</p>
      {!message.read && (
        <button
          onClick={() => onMarkRead(message.id)}
          className="text-xs text-fjord hover:text-bone transition-colors"
        >
          Mark as read
        </button>
      )}
    </motion.div>
  )
}

// Habit Management Modal Component
function HabitManagementModal({
  isOpen,
  onClose,
  habits,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive
}: {
  isOpen: boolean
  onClose: () => void
  habits: Habit[]
  onAdd: (name: string) => void
  onEdit: (id: string, name: string) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string) => void
}) {
  const [newHabitName, setNewHabitName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleAdd = () => {
    if (newHabitName.trim()) {
      onAdd(newHabitName.trim())
      setNewHabitName('')
    }
  }

  const startEditing = (habit: Habit) => {
    setEditingId(habit.id)
    setEditingName(habit.name)
  }

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      onEdit(editingId, editingName.trim())
      setEditingId(null)
      setEditingName('')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-8 w-full max-w-md relative z-10 max-h-[80vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-victory-green/20 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-victory-green" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Manage Habits</h2>
                  <p className="text-fog text-sm">Add, edit, or remove habits</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add new habit */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="New habit name..."
                className="input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <button
                onClick={handleAdd}
                className="btn-secondary px-4"
                disabled={!newHabitName.trim()}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Habit list */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  className={`glass-recessed p-3 rounded-lg flex items-center gap-3 ${
                    !habit.active ? 'opacity-50' : ''
                  }`}
                >
                  {editingId === habit.id ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="input flex-1 py-1"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <button
                        onClick={saveEdit}
                        className="text-victory-green hover:text-bone transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-stone hover:text-bone transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onToggleActive(habit.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                          habit.active
                            ? 'bg-victory-green border-victory-green'
                            : 'border-2 border-stone'
                        }`}
                      >
                        {habit.active && (
                          <svg viewBox="0 0 24 24" className="w-3 h-3 text-forge-black">
                            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                      </button>
                      <span className="flex-1 text-fog">{habit.name}</span>
                      <button
                        onClick={() => startEditing(habit)}
                        className="text-stone hover:text-bone transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(habit.id)}
                        className="text-blood-red hover:text-bone transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
              {habits.length === 0 && (
                <div className="text-center py-8 text-stone">
                  No habits yet. Add one above!
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Bearing Modal Component
function BearingModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  periodStart,
  periodEnd,
  existingBearing
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (bearing: Omit<Bearing, 'id' | 'created_at'>) => void
  type: 'weekly' | 'monthly'
  periodStart: string
  periodEnd: string
  existingBearing?: Bearing
}) {
  const [wins, setWins] = useState<string[]>(existingBearing?.wins ?? [''])
  const [challenges, setChallenges] = useState<string[]>(existingBearing?.challenges ?? [''])
  const [lessons, setLessons] = useState(existingBearing?.lessons ?? '')
  const [focus, setFocus] = useState(existingBearing?.focus ?? '')

  useEffect(() => {
    if (isOpen) {
      setWins(existingBearing?.wins?.length ? existingBearing.wins : [''])
      setChallenges(existingBearing?.challenges?.length ? existingBearing.challenges : [''])
      setLessons(existingBearing?.lessons ?? '')
      setFocus(existingBearing?.focus ?? '')
    }
  }, [isOpen, existingBearing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      type,
      period_start: periodStart,
      period_end: periodEnd,
      wins: wins.filter(w => w.trim()),
      challenges: challenges.filter(c => c.trim()),
      lessons: lessons.trim(),
      focus: focus.trim()
    })
    onClose()
  }

  const updateList = (list: string[], setList: (v: string[]) => void, index: number, value: string) => {
    const updated = [...list]
    updated[index] = value
    setList(updated)
  }

  const addToList = (list: string[], setList: (v: string[]) => void) => {
    setList([...list, ''])
  }

  const removeFromList = (list: string[], setList: (v: string[]) => void, index: number) => {
    if (list.length > 1) {
      setList(list.filter((_, i) => i !== index))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-8 w-full max-w-lg relative z-10 max-h-[85vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-fjord/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-fjord" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {type === 'weekly' ? 'Weekly' : 'Monthly'} Bearing
                  </h2>
                  <p className="text-fog text-sm">{formatPeriod(periodStart, periodEnd, type)}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Wins */}
              <div>
                <label className="stat-label block mb-2">Wins - What went well?</label>
                {wins.map((win, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={win}
                      onChange={(e) => updateList(wins, setWins, index, e.target.value)}
                      placeholder="Something that went well..."
                      className="input flex-1"
                    />
                    {wins.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFromList(wins, setWins, index)}
                        className="text-stone hover:text-blood-red transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addToList(wins, setWins)}
                  className="text-xs text-fjord hover:text-bone transition-colors"
                >
                  + Add another win
                </button>
              </div>

              {/* Challenges */}
              <div>
                <label className="stat-label block mb-2">Challenges - What was difficult?</label>
                {challenges.map((challenge, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={challenge}
                      onChange={(e) => updateList(challenges, setChallenges, index, e.target.value)}
                      placeholder="A challenge you faced..."
                      className="input flex-1"
                    />
                    {challenges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFromList(challenges, setChallenges, index)}
                        className="text-stone hover:text-blood-red transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addToList(challenges, setChallenges)}
                  className="text-xs text-fjord hover:text-bone transition-colors"
                >
                  + Add another challenge
                </button>
              </div>

              {/* Lessons */}
              <div>
                <label className="stat-label block mb-2">Lessons - What did you learn?</label>
                <textarea
                  value={lessons}
                  onChange={(e) => setLessons(e.target.value)}
                  placeholder="Key lessons or insights..."
                  className="input w-full h-20 resize-none"
                />
              </div>

              {/* Focus */}
              <div>
                <label className="stat-label block mb-2">Focus - What's next?</label>
                <textarea
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="Your focus for the next period..."
                  className="input w-full h-20 resize-none"
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                {existingBearing ? 'Update Bearing' : 'Save Bearing'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Bearing Display Card Component
function BearingDisplayCard({ bearing, onEdit }: { bearing: Bearing; onEdit: () => void }) {
  return (
    <motion.div
      className="glass-recessed p-4 rounded-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            bearing.type === 'weekly' ? 'bg-fjord/30 text-fjord' : 'bg-ember/30 text-ember'
          }`}>
            {bearing.type === 'weekly' ? 'Weekly' : 'Monthly'}
          </span>
          <span className="text-caption text-stone">
            {formatPeriod(bearing.period_start, bearing.period_end, bearing.type)}
          </span>
        </div>
        <button
          onClick={onEdit}
          className="text-xs text-stone hover:text-fog transition-colors"
        >
          Edit
        </button>
      </div>

      {bearing.wins.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-victory-green mb-1">Wins</p>
          <ul className="text-fog text-sm space-y-0.5">
            {bearing.wins.map((win, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-victory-green">•</span>
                {win}
              </li>
            ))}
          </ul>
        </div>
      )}

      {bearing.focus && (
        <div className="glass-recessed p-2 rounded text-sm">
          <span className="text-caption text-stone">Focus: </span>
          <span className="text-fog">{bearing.focus}</span>
        </div>
      )}
    </motion.div>
  )
}

// Goal Category Config
const GOAL_CATEGORIES: { value: LifeGoal['category']; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'health', label: 'Health', icon: Heart, color: 'text-blood-red' },
  { value: 'career', label: 'Career', icon: Briefcase, color: 'text-ember' },
  { value: 'relationships', label: 'Relationships', icon: Users, color: 'text-fjord' },
  { value: 'growth', label: 'Growth', icon: Brain, color: 'text-victory-green' },
  { value: 'financial', label: 'Financial', icon: DollarSign, color: 'text-ember' },
  { value: 'other', label: 'Other', icon: Star, color: 'text-fog' },
]

// True North Modal Component
function TrueNorthModal({
  isOpen,
  onClose,
  onSubmit,
  existingGoal
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (goal: Omit<LifeGoal, 'id' | 'created_at' | 'progress'>) => void
  existingGoal?: LifeGoal
}) {
  const [category, setCategory] = useState<LifeGoal['category']>(existingGoal?.category ?? 'growth')
  const [title, setTitle] = useState(existingGoal?.title ?? '')
  const [description, setDescription] = useState(existingGoal?.description ?? '')
  const [why, setWhy] = useState(existingGoal?.why ?? '')
  const [targetDate, setTargetDate] = useState(existingGoal?.target_date ?? '')

  useEffect(() => {
    if (isOpen) {
      setCategory(existingGoal?.category ?? 'growth')
      setTitle(existingGoal?.title ?? '')
      setDescription(existingGoal?.description ?? '')
      setWhy(existingGoal?.why ?? '')
      setTargetDate(existingGoal?.target_date ?? '')
    }
  }, [isOpen, existingGoal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSubmit({
        category,
        title: title.trim(),
        description: description.trim(),
        why: why.trim(),
        target_date: targetDate || undefined
      })
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-8 w-full max-w-lg relative z-10 max-h-[85vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ember/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-ember" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {existingGoal ? 'Edit Goal' : 'Set True North'}
                  </h2>
                  <p className="text-fog text-sm">Your long-term life goal</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="stat-label block mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {GOAL_CATEGORIES.map((cat) => {
                    const IconComponent = cat.icon
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                          category === cat.value
                            ? 'bg-ember/20 border border-ember/30'
                            : 'glass-recessed hover:bg-iron-slate/50'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 ${cat.color}`} />
                        <span className="text-xs text-fog">{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="stat-label block mb-2">Goal</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What do you want to achieve?"
                  className="input w-full"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="stat-label block mb-2">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="More details about this goal..."
                  className="input w-full h-16 resize-none"
                />
              </div>

              {/* Why */}
              <div>
                <label className="stat-label block mb-2">Why does this matter?</label>
                <textarea
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  placeholder="Your deeper motivation..."
                  className="input w-full h-16 resize-none"
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="stat-label block mb-2">Target date (optional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="input w-full"
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                {existingGoal ? 'Update Goal' : 'Set Goal'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Life Goal Card Component
function LifeGoalCard({
  goal,
  onEdit,
  onUpdateProgress,
  onDelete
}: {
  goal: LifeGoal
  onEdit: () => void
  onUpdateProgress: (progress: number) => void
  onDelete: () => void
}) {
  const categoryConfig = GOAL_CATEGORIES.find(c => c.value === goal.category) ?? GOAL_CATEGORIES[5]!
  const IconComponent = categoryConfig.icon

  return (
    <motion.div
      className="glass-recessed p-4 rounded-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconComponent className={`w-4 h-4 ${categoryConfig.color}`} />
          <span className="text-xs text-stone uppercase">{categoryConfig.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="text-xs text-stone hover:text-fog transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-stone hover:text-blood-red transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <h4 className="font-display text-bone font-semibold mb-2">{goal.title}</h4>

      {goal.why && (
        <p className="text-fog text-sm mb-3 italic">"{goal.why}"</p>
      )}

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-caption text-fog">Progress</span>
          <span className="font-mono text-sm text-ember">{goal.progress}%</span>
        </div>
        <div className="progress-bar h-2">
          <motion.div
            className="progress-fill progress-fill-ember"
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Quick progress buttons */}
      <div className="flex gap-1 justify-end">
        {[0, 25, 50, 75, 100].map((p) => (
          <button
            key={p}
            onClick={() => onUpdateProgress(p)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              goal.progress === p
                ? 'bg-ember/30 text-ember'
                : 'glass-recessed text-stone hover:text-fog'
            }`}
          >
            {p}%
          </button>
        ))}
      </div>

      {goal.target_date && (
        <div className="mt-3 text-xs text-stone">
          Target: {new Date(goal.target_date + 'T00:00:00').toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      )}
    </motion.div>
  )
}

// Waypoint Modal Component
function WaypointModal({
  isOpen,
  onClose,
  onSubmit,
  lifeGoals,
  existingWaypoint
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (waypoint: Omit<Waypoint, 'id' | 'created_at'>) => void
  lifeGoals: LifeGoal[]
  existingWaypoint?: Waypoint
}) {
  const [title, setTitle] = useState(existingWaypoint?.title ?? '')
  const [description, setDescription] = useState(existingWaypoint?.description ?? '')
  const [achievedDate, setAchievedDate] = useState(existingWaypoint?.achieved_date ?? getTodayString())
  const [goalId, setGoalId] = useState(existingWaypoint?.goal_id ?? '')

  useEffect(() => {
    if (isOpen) {
      setTitle(existingWaypoint?.title ?? '')
      setDescription(existingWaypoint?.description ?? '')
      setAchievedDate(existingWaypoint?.achieved_date ?? getTodayString())
      setGoalId(existingWaypoint?.goal_id ?? '')
    }
  }, [isOpen, existingWaypoint])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        achieved_date: achievedDate,
        goal_id: goalId || undefined
      })
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-8 w-full max-w-md relative z-10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-victory-green/20 flex items-center justify-center">
                  <Flag className="w-5 h-5 text-victory-green" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {existingWaypoint ? 'Edit Waypoint' : 'Log Milestone'}
                  </h2>
                  <p className="text-fog text-sm">Mark an achievement</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="stat-label block mb-2">What did you achieve?</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., First 5k run, Launched my website"
                  className="input w-full"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="stat-label block mb-2">Details (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="How it happened, how you felt..."
                  className="input w-full h-20 resize-none"
                />
              </div>

              <div>
                <label className="stat-label block mb-2">When?</label>
                <input
                  type="date"
                  value={achievedDate}
                  max={getTodayString()}
                  onChange={(e) => setAchievedDate(e.target.value)}
                  className="input w-full"
                />
              </div>

              {lifeGoals.length > 0 && (
                <div>
                  <label className="stat-label block mb-2">Related to goal (optional)</label>
                  <select
                    value={goalId}
                    onChange={(e) => setGoalId(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">No specific goal</option>
                    {lifeGoals.map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <button type="submit" className="btn-primary w-full">
                {existingWaypoint ? 'Update Waypoint' : 'Log Milestone'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Waypoint Card Component
function WaypointCard({
  waypoint,
  linkedGoal,
  onDelete
}: {
  waypoint: Waypoint
  linkedGoal?: LifeGoal
  onDelete: () => void
}) {
  const achievedDate = new Date(waypoint.achieved_date + 'T00:00:00')
  const daysAgo = Math.floor((Date.now() - achievedDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <motion.div
      className="glass-recessed p-4 rounded-lg border-l-2 border-victory-green"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-victory-green" />
          <span className="text-caption text-stone">
            {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="text-xs text-stone hover:text-blood-red transition-colors"
        >
          Delete
        </button>
      </div>

      <h4 className="font-display text-bone font-semibold mb-1">{waypoint.title}</h4>

      {waypoint.description && (
        <p className="text-fog text-sm mb-2">{waypoint.description}</p>
      )}

      {linkedGoal && (
        <div className="flex items-center gap-1 text-xs text-fjord">
          <Star className="w-3 h-3" />
          <span>{linkedGoal.title}</span>
        </div>
      )}
    </motion.div>
  )
}

// Direction Card Component
function DirectionCard({
  title,
  icon: Icon,
  children,
  delay = 0
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      className="direction-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-ember" />
          </div>
          <h3 className="font-display text-lg text-bone font-semibold tracking-wide">{title}</h3>
        </div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

// Quick Log Modal Component with Historical Date Support
function QuickLogModal({
  isOpen,
  onClose,
  type,
  onSubmit
}: {
  isOpen: boolean
  onClose: () => void
  type: 'calories' | 'weight' | 'heading'
  onSubmit: (value: string, date: string) => void
}) {
  const [value, setValue] = useState('')
  const [selectedDate, setSelectedDate] = useState(getTodayString())

  // Reset date when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(getTodayString())
      setValue('')
    }
  }, [isOpen])

  const config = {
    calories: { title: 'Log Calories', placeholder: 'e.g. 1700', unit: 'kcal', icon: Flame, supportsHistory: true },
    weight: { title: 'Log Weight', placeholder: 'e.g. 82.5', unit: 'kg', icon: Scale, supportsHistory: true },
    heading: { title: "Set Today's Heading", placeholder: 'What will you focus on today?', unit: '', icon: Target, supportsHistory: false },
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value, selectedDate)
      setValue('')
      setSelectedDate(getTodayString())
      onClose()
    }
  }

  const today = getTodayString()
  const isToday = selectedDate === today
  const IconComponent = config[type].icon
  const supportsHistory = config[type].supportsHistory

  // Quick date buttons for recent days
  const quickDates = [
    { label: 'Today', date: getDateOffset(0) },
    { label: 'Yesterday', date: getDateOffset(-1) },
    { label: '2 days ago', date: getDateOffset(-2) },
  ]

  const adjustDate = (days: number) => {
    const current = new Date(selectedDate + 'T00:00:00')
    current.setDate(current.getDate() + days)
    const newDate = current.toISOString().split('T')[0] ?? ''
    // Don't allow future dates
    if (newDate <= today) {
      setSelectedDate(newDate)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="glass-modal p-8 w-full max-w-md relative z-10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ember/20 flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-ember" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">{config[type].title}</h2>
                  {supportsHistory && !isToday && (
                    <p className="text-xs text-fjord">Logging for {formatShortDate(selectedDate)}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Date Selection - only for calories and weight */}
              {supportsHistory && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-fog" />
                      <span className="text-caption text-fog">DATE</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => adjustDate(-1)}
                        className="w-7 h-7 rounded-lg glass-recessed flex items-center justify-center text-fog hover:text-bone transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustDate(1)}
                        disabled={isToday}
                        className="w-7 h-7 rounded-lg glass-recessed flex items-center justify-center text-fog hover:text-bone transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {quickDates.map((qd) => (
                      <button
                        key={qd.date}
                        type="button"
                        onClick={() => setSelectedDate(qd.date)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          selectedDate === qd.date
                            ? 'bg-ember/20 text-ember border border-ember/30'
                            : 'glass-recessed text-fog hover:text-bone'
                        }`}
                      >
                        {qd.label}
                      </button>
                    ))}
                  </div>
                  {/* Custom date input */}
                  <input
                    type="date"
                    value={selectedDate}
                    max={today}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-2 w-full input text-sm"
                  />
                </div>
              )}

              <div className="flex gap-3 items-center">
                <input
                  type={type === 'heading' ? 'text' : 'number'}
                  step={type === 'weight' ? '0.1' : '1'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={config[type].placeholder}
                  className="input flex-1 text-lg"
                  autoFocus
                />
                {config[type].unit && (
                  <span className="text-fog text-body-md font-mono">{config[type].unit}</span>
                )}
              </div>

              <button type="submit" className="btn-primary w-full mt-6">
                {isToday || !supportsHistory ? 'Log Entry' : `Log for ${formatShortDate(selectedDate)}`}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Direction tabs configuration
const DIRECTIONS = [
  { id: 'overview', label: 'Overview', icon: CompassIcon },
  { id: 'nutrition', label: 'Nutrition', icon: Flame },
  { id: 'habits', label: 'Habits', icon: CheckSquare },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'bearings', label: 'Bearings', icon: BookOpen },
  { id: 'truenorth', label: 'True North', icon: Star },
  { id: 'waypoints', label: 'Waypoints', icon: Flag },
] as const

type DirectionTab = typeof DIRECTIONS[number]['id']

// Mode Toggle Component
function ModeToggle({ mode, onToggle }: { mode: 'view' | 'log'; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-recessed hover:bg-white/5 transition-all"
    >
      <div className="flex items-center gap-1 text-xs">
        <span className={mode === 'view' ? 'text-ember font-medium' : 'text-stone'}>View</span>
        <div className="relative w-10 h-5 rounded-full bg-iron-slate/50 border border-white/10">
          <motion.div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-ember"
            animate={{ left: mode === 'view' ? '2px' : '22px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
        <span className={mode === 'log' ? 'text-ember font-medium' : 'text-stone'}>Log</span>
      </div>
    </button>
  )
}

// Main Dashboard Component
export default function KnarrDashboard() {
  const { user, isLoading: authLoading, isConfigured, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState('Voyager')
  const [mode, setMode] = useState<'view' | 'log'>('view')
  const [modalType, setModalType] = useState<'calories' | 'weight' | 'heading' | null>(null)
  const [showWeightGoalModal, setShowWeightGoalModal] = useState(false)
  const [showWriteMessageModal, setShowWriteMessageModal] = useState(false)
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [activeTab, setActiveTab] = useState<DirectionTab>('overview')

  // Data state
  const [calories, setCalories] = useState<CalorieLog[]>([])
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [headings, setHeadings] = useState<Heading[]>([])
  const [weightGoal, setWeightGoal] = useState<number | null>(null)
  const [calorieGoal, setCalorieGoal] = useState<number | null>(null)
  const [showCalorieGoalModal, setShowCalorieGoalModal] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [bearings, setBearings] = useState<Bearing[]>([])
  const [showBearingModal, setShowBearingModal] = useState(false)
  const [bearingType, setBearingType] = useState<'weekly' | 'monthly'>('weekly')
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[]>([])
  const [showTrueNorthModal, setShowTrueNorthModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<LifeGoal | undefined>(undefined)
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [showWaypointModal, setShowWaypointModal] = useState(false)

  // Inline edit state for header stats
  const [editingStat, setEditingStat] = useState<'calories' | 'weight' | 'heading' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newHabitName, setNewHabitName] = useState('')

  // Auth and onboarding state
  const [devBypass, setDevBypass] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true) // Default true to avoid flash

  const today = getTodayString()

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)

    // Check onboarding status
    const onboardingDone = getFromStorage<boolean>(STORAGE_KEYS.onboardingComplete, false)
    setHasCompletedOnboarding(onboardingDone)
    if (!onboardingDone) {
      setShowOnboarding(true)
    }

    // Load user name
    const savedName = getFromStorage<string>(STORAGE_KEYS.userName, 'Voyager')
    setUserName(savedName)

    // Load data
    setCalories(getFromStorage(STORAGE_KEYS.calories, []))
    setWeights(getFromStorage(STORAGE_KEYS.weights, []))
    setHabits(getFromStorage(STORAGE_KEYS.habits, []))
    setHabitLogs(getFromStorage(STORAGE_KEYS.habitLogs, []))
    setHeadings(getFromStorage(STORAGE_KEYS.headings, []))
    const savedGoal = getFromStorage<number | null>(STORAGE_KEYS.weightGoal, null)
    setWeightGoal(savedGoal && savedGoal > 0 ? savedGoal : null)
    const savedCalorieGoal = getFromStorage<number | null>(STORAGE_KEYS.calorieGoal, null)
    setCalorieGoal(savedCalorieGoal && savedCalorieGoal > 0 ? savedCalorieGoal : null)
    setMessages(getFromStorage(STORAGE_KEYS.messages, []))
    setBearings(getFromStorage(STORAGE_KEYS.bearings, []))
    setLifeGoals(getFromStorage(STORAGE_KEYS.lifeGoals, []))
    setWaypoints(getFromStorage(STORAGE_KEYS.waypoints, []))
  }, [])

  // Today's data
  const todayCalories = calories.find(c => c.date === today)
  const todayWeight = weights.find(w => w.date === today)
  const todayHeading = headings.find(h => h.date === today)
  const todayHabitLogs = habitLogs.filter(l => l.date === today)
  const activeHabits = habits.filter(h => h.active)
  const completedHabits = todayHabitLogs.filter(l => l.completed).length

  // Weight calculations
  const latestWeight = weights.length > 0
    ? [...weights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null
  const rollingAverage = calculateRollingAverage(weights, 7)
  const weightTrend = calculateTrend(weights)
  const goalDirection: 'up' | 'down' | undefined = weightGoal && latestWeight
    ? (weightGoal > latestWeight.weight ? 'up' : 'down')
    : undefined
  const progressToGoal = weightGoal && rollingAverage
    ? getProgressToGoal(rollingAverage, weightGoal)
    : null

  // Streak calculations
  const calorieStreak = calories.length
  const habitStreak = habitLogs.filter(l => l.completed).length > 0 ?
    Math.floor(habitLogs.filter(l => l.completed).length / Math.max(1, activeHabits.length)) : 0

  // Messages calculations
  const arrivedMessages = messages
    .filter(m => m.deliver_at <= today)
    .sort((a, b) => new Date(b.deliver_at).getTime() - new Date(a.deliver_at).getTime())
  const unreadMessages = arrivedMessages.filter(m => !m.read)
  const pendingMessages = messages.filter(m => m.deliver_at > today)

  // Bearings calculations
  const currentWeekBounds = getWeekBounds(new Date())
  const currentMonthBounds = getMonthBounds(new Date())
  const currentWeekBearing = bearings.find(
    b => b.type === 'weekly' && b.period_start === currentWeekBounds.start
  )
  const currentMonthBearing = bearings.find(
    b => b.type === 'monthly' && b.period_start === currentMonthBounds.start
  )
  const recentBearings = bearings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)

  // Handlers
  const handleLogCalories = (value: string, date: string) => {
    const newLog: CalorieLog = {
      id: crypto.randomUUID(),
      date: date,
      calories: parseInt(value),
      created_at: new Date().toISOString(),
    }
    // Replace entry for the same date if it exists
    const updated = [...calories.filter(c => c.date !== date), newLog]
    setCalories(updated)
    setToStorage(STORAGE_KEYS.calories, updated)
  }

  const handleLogWeight = (value: string, date: string) => {
    const newEntry: WeightEntry = {
      id: crypto.randomUUID(),
      date: date,
      weight: parseFloat(value),
      created_at: new Date().toISOString(),
    }
    // Replace entry for the same date if it exists
    const updated = [...weights.filter(w => w.date !== date), newEntry]
    setWeights(updated)
    setToStorage(STORAGE_KEYS.weights, updated)
  }

  const handleSetHeading = (value: string, _date: string) => {
    // Headings always use today - historical headings don't make sense
    const newHeading: Heading = {
      id: crypto.randomUUID(),
      date: today,
      intention: value,
      completed: false,
    }
    const updated = [...headings.filter(h => h.date !== today), newHeading]
    setHeadings(updated)
    setToStorage(STORAGE_KEYS.headings, updated)
  }

  const toggleHabit = (habitId: string) => {
    const existingLog = todayHabitLogs.find(l => l.habit_id === habitId)

    if (existingLog) {
      const updated = habitLogs.map(l =>
        l.id === existingLog.id ? { ...l, completed: !l.completed } : l
      )
      setHabitLogs(updated)
      setToStorage(STORAGE_KEYS.habitLogs, updated)
    } else {
      const newLog: HabitLog = {
        id: crypto.randomUUID(),
        habit_id: habitId,
        date: today,
        completed: true,
      }
      const updated = [...habitLogs, newLog]
      setHabitLogs(updated)
      setToStorage(STORAGE_KEYS.habitLogs, updated)
    }
  }

  const handleSetWeightGoal = (goal: number) => {
    if (goal === 0) {
      setWeightGoal(null)
      setToStorage(STORAGE_KEYS.weightGoal, null)
    } else {
      setWeightGoal(goal)
      setToStorage(STORAGE_KEYS.weightGoal, goal)
    }
  }

  const handleSetCalorieGoal = (goal: number) => {
    if (goal === 0) {
      setCalorieGoal(null)
      setToStorage(STORAGE_KEYS.calorieGoal, null)
    } else {
      setCalorieGoal(goal)
      setToStorage(STORAGE_KEYS.calorieGoal, goal)
    }
  }

  const loadSampleWeightData = () => {
    const sampleWeights: WeightEntry[] = []
    const baseWeight = 85
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const variation = (Math.random() - 0.5) * 1.5 - (i * 0.08) // Slight downward trend
      sampleWeights.push({
        id: crypto.randomUUID(),
        date: date.toISOString().split('T')[0]!,
        weight: Math.round((baseWeight + variation) * 10) / 10,
        created_at: date.toISOString(),
      })
    }
    setWeights(sampleWeights)
    setToStorage(STORAGE_KEYS.weights, sampleWeights)
    if (!weightGoal) {
      setWeightGoal(80)
      setToStorage(STORAGE_KEYS.weightGoal, 80)
    }
  }

  const handleAddMessage = (messageData: Omit<Message, 'id' | 'read'>) => {
    const newMessage: Message = {
      ...messageData,
      id: crypto.randomUUID(),
      read: false,
    }
    const updated = [...messages, newMessage]
    setMessages(updated)
    setToStorage(STORAGE_KEYS.messages, updated)
  }

  const handleMarkMessageRead = (id: string) => {
    const updated = messages.map(m =>
      m.id === id ? { ...m, read: true } : m
    )
    setMessages(updated)
    setToStorage(STORAGE_KEYS.messages, updated)
  }

  const handleAddHabit = (name: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      active: true,
    }
    const updated = [...habits, newHabit]
    setHabits(updated)
    setToStorage(STORAGE_KEYS.habits, updated)
  }

  const handleEditHabit = (id: string, name: string) => {
    const updated = habits.map(h =>
      h.id === id ? { ...h, name } : h
    )
    setHabits(updated)
    setToStorage(STORAGE_KEYS.habits, updated)
  }

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id)
    setHabits(updated)
    setToStorage(STORAGE_KEYS.habits, updated)
    // Also clean up habit logs for this habit
    const updatedLogs = habitLogs.filter(l => l.habit_id !== id)
    setHabitLogs(updatedLogs)
    setToStorage(STORAGE_KEYS.habitLogs, updatedLogs)
  }

  const handleToggleHabitActive = (id: string) => {
    const updated = habits.map(h =>
      h.id === id ? { ...h, active: !h.active } : h
    )
    setHabits(updated)
    setToStorage(STORAGE_KEYS.habits, updated)
  }

  const handleSaveBearing = (bearingData: Omit<Bearing, 'id' | 'created_at'>) => {
    // Check if a bearing for this period already exists
    const existingIndex = bearings.findIndex(
      b => b.type === bearingData.type && b.period_start === bearingData.period_start
    )

    if (existingIndex !== -1) {
      // Update existing bearing
      const updated = [...bearings]
      updated[existingIndex] = {
        ...bearings[existingIndex]!,
        ...bearingData
      }
      setBearings(updated)
      setToStorage(STORAGE_KEYS.bearings, updated)
    } else {
      // Create new bearing
      const newBearing: Bearing = {
        ...bearingData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      }
      const updated = [...bearings, newBearing]
      setBearings(updated)
      setToStorage(STORAGE_KEYS.bearings, updated)
    }
  }

  const openBearingModal = (type: 'weekly' | 'monthly') => {
    setBearingType(type)
    setShowBearingModal(true)
  }

  const handleAddLifeGoal = (goalData: Omit<LifeGoal, 'id' | 'created_at' | 'progress'>) => {
    if (editingGoal) {
      // Update existing goal
      const updated = lifeGoals.map(g =>
        g.id === editingGoal.id ? { ...g, ...goalData } : g
      )
      setLifeGoals(updated)
      setToStorage(STORAGE_KEYS.lifeGoals, updated)
    } else {
      // Create new goal
      const newGoal: LifeGoal = {
        ...goalData,
        id: crypto.randomUUID(),
        progress: 0,
        created_at: new Date().toISOString()
      }
      const updated = [...lifeGoals, newGoal]
      setLifeGoals(updated)
      setToStorage(STORAGE_KEYS.lifeGoals, updated)
    }
    setEditingGoal(undefined)
  }

  const handleUpdateGoalProgress = (goalId: string, progress: number) => {
    const updated = lifeGoals.map(g =>
      g.id === goalId ? { ...g, progress } : g
    )
    setLifeGoals(updated)
    setToStorage(STORAGE_KEYS.lifeGoals, updated)
  }

  const handleDeleteLifeGoal = (goalId: string) => {
    const updated = lifeGoals.filter(g => g.id !== goalId)
    setLifeGoals(updated)
    setToStorage(STORAGE_KEYS.lifeGoals, updated)
  }

  const openEditGoal = (goal: LifeGoal) => {
    setEditingGoal(goal)
    setShowTrueNorthModal(true)
  }

  const handleAddWaypoint = (waypointData: Omit<Waypoint, 'id' | 'created_at'>) => {
    const newWaypoint: Waypoint = {
      ...waypointData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    }
    const updated = [...waypoints, newWaypoint]
    setWaypoints(updated)
    setToStorage(STORAGE_KEYS.waypoints, updated)
  }

  const handleDeleteWaypoint = (waypointId: string) => {
    const updated = waypoints.filter(w => w.id !== waypointId)
    setWaypoints(updated)
    setToStorage(STORAGE_KEYS.waypoints, updated)
  }

  // Onboarding completion handler
  const handleOnboardingComplete = (data: {
    name: string
    focusAreas: string[]
    weightGoal: number | null
    currentWeight: number | null
    calorieGoal: number | null
    initialHabits: string[]
  }) => {
    // Save user name
    setUserName(data.name)
    setToStorage(STORAGE_KEYS.userName, data.name)

    // Save weight goal if provided
    if (data.weightGoal) {
      setWeightGoal(data.weightGoal)
      setToStorage(STORAGE_KEYS.weightGoal, data.weightGoal)
    }

    // Save calorie goal if provided
    if (data.calorieGoal) {
      setCalorieGoal(data.calorieGoal)
      setToStorage(STORAGE_KEYS.calorieGoal, data.calorieGoal)
    }

    // Add current weight as first entry if provided
    if (data.currentWeight) {
      const weightEntry: WeightEntry = {
        id: crypto.randomUUID(),
        date: today,
        weight: data.currentWeight,
        created_at: new Date().toISOString()
      }
      const updatedWeights = [...weights, weightEntry]
      setWeights(updatedWeights)
      setToStorage(STORAGE_KEYS.weights, updatedWeights)
    }

    // Create initial habits
    if (data.initialHabits.length > 0) {
      const newHabits: Habit[] = data.initialHabits.map(name => ({
        id: crypto.randomUUID(),
        name,
        active: true
      }))
      const updatedHabits = [...habits, ...newHabits]
      setHabits(updatedHabits)
      setToStorage(STORAGE_KEYS.habits, updatedHabits)
    }

    // Mark onboarding as complete
    setHasCompletedOnboarding(true)
    setShowOnboarding(false)
    setToStorage(STORAGE_KEYS.onboardingComplete, true)
  }

  // Recent waypoints
  const recentWaypoints = [...waypoints]
    .sort((a, b) => new Date(b.achieved_date).getTime() - new Date(a.achieved_date).getTime())
    .slice(0, 10)

  // Loading state
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-forge-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CompassIcon className="w-16 h-16 text-ember" />
        </motion.div>
      </div>
    )
  }

  // Auth check - show login screen if Supabase is configured but user isn't logged in
  // Dev bypass allows skipping auth during development
  if (isConfigured && !user && !devBypass) {
    return <AuthScreen onDevBypass={() => setDevBypass(true)} />
  }

  // Onboarding check - show onboarding flow for first-time users
  if (showOnboarding && !hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onEnded={(e) => {
            // Pause at last frame when video ends
            const video = e.currentTarget
            video.currentTime = video.duration
            video.pause()
          }}
          poster="/wavesbg.jpg"
        >
          <source src="/bgmov.mp4" type="video/mp4" />
          <source src="/bgmov.webm" type="video/webm" />
          <source src="/bgmov.mov" type="video/quicktime" />
        </video>
        {/* Overlay with brightness variance - lightened for better visibility */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 20%, rgba(255, 255, 255, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 40% 60% at 10% 50%, rgba(201, 162, 39, 0.06) 0%, transparent 50%),
              radial-gradient(ellipse 40% 60% at 90% 60%, rgba(61, 90, 108, 0.08) 0%, transparent 50%),
              linear-gradient(180deg, rgba(13, 13, 15, 0.25) 0%, rgba(13, 13, 15, 0.15) 30%, rgba(13, 13, 15, 0.2) 70%, rgba(13, 13, 15, 0.4) 100%)
            `
          }}
        />
      </div>

      {/* Background layers */}
      <div className="page-background z-[1] hidden" />
      <div className="frost-overlay z-[2]" />
      <div className="vignette z-[3]" />

      {/* Compass rose watermark */}
      <CompassRose className="compass-watermark text-bone z-[4]" />

      {/* Content */}
      <div className="relative z-[5]">
        {/* Header */}
        <header className="page-header border-b border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img src="/iconmain.png" alt="Knarr" className="h-11 w-auto" />
                <div className="leading-tight">
                  <h1 className="font-display text-2xl text-bone font-bold tracking-wide">Knarr</h1>
                  <p className="text-fog text-sm -mt-0.5">{formatDate(new Date())}</p>
                </div>
              </motion.div>

              {/* Steady Course Stats in Header - Clickable/Editable */}
              <motion.div
                className="hidden lg:flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                {/* Streak (read-only) */}
                <div className="glass-recessed px-4 py-2 rounded-xl flex flex-col items-center gap-0.5 min-w-[90px]">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-ember" />
                    <span className="font-mono text-base text-ember font-semibold">{Math.max(calorieStreak, habitStreak)}</span>
                  </div>
                  <span className="text-[10px] text-stone">streak</span>
                </div>

                {/* Calories (editable) */}
                {editingStat === 'calories' ? (
                  <div className="glass-recessed px-3 py-2 rounded-xl flex items-center gap-2 min-w-[100px] ring-1 ring-ember/50">
                    <Flame className="w-3.5 h-3.5 text-ember" />
                    <input
                      type="number"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editValue) {
                          handleLogCalories(editValue, today)
                          setEditingStat(null)
                          setEditValue('')
                        } else if (e.key === 'Escape') {
                          setEditingStat(null)
                          setEditValue('')
                        }
                      }}
                      onBlur={() => {
                        if (editValue) handleLogCalories(editValue, today)
                        setEditingStat(null)
                        setEditValue('')
                      }}
                      className="bg-transparent text-bone font-mono text-base font-semibold w-16 focus:outline-none"
                      placeholder="kcal"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingStat('calories')
                      setEditValue(todayCalories ? String(todayCalories.calories) : '')
                    }}
                    className="glass-recessed px-4 py-2 rounded-xl flex flex-col items-center gap-0.5 min-w-[90px] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-ember" />
                      <span className="font-mono text-base text-bone font-semibold">{todayCalories ? todayCalories.calories.toLocaleString() : '--'}</span>
                    </div>
                    <span className="text-[10px] text-stone">kcal</span>
                  </button>
                )}

                {/* Weight (editable) */}
                {editingStat === 'weight' ? (
                  <div className="glass-recessed px-3 py-2 rounded-xl flex items-center gap-2 min-w-[90px] ring-1 ring-fjord/50">
                    <Scale className="w-3.5 h-3.5 text-fjord" />
                    <input
                      type="number"
                      step="0.1"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editValue) {
                          handleLogWeight(editValue, today)
                          setEditingStat(null)
                          setEditValue('')
                        } else if (e.key === 'Escape') {
                          setEditingStat(null)
                          setEditValue('')
                        }
                      }}
                      onBlur={() => {
                        if (editValue) handleLogWeight(editValue, today)
                        setEditingStat(null)
                        setEditValue('')
                      }}
                      className="bg-transparent text-bone font-mono text-base font-semibold w-14 focus:outline-none"
                      placeholder="kg"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingStat('weight')
                      setEditValue(latestWeight ? String(latestWeight.weight) : '')
                    }}
                    className="glass-recessed px-4 py-2 rounded-xl flex flex-col items-center gap-0.5 min-w-[90px] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-fjord" />
                      <span className="font-mono text-base text-bone font-semibold">{latestWeight ? latestWeight.weight : '--'}</span>
                    </div>
                    <span className="text-[10px] text-stone">kg</span>
                  </button>
                )}

                {/* Habits (read-only, shows count) */}
                <div className="glass-recessed px-4 py-2 rounded-xl flex flex-col items-center gap-0.5 min-w-[90px]">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-victory-green" />
                    <span className="font-mono text-base font-semibold">
                      <span className="text-victory-green">{completedHabits}</span>
                      <span className="text-stone">/{activeHabits.length}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-stone">habits</span>
                </div>

                {/* Heading (editable) */}
                {editingStat === 'heading' ? (
                  <div className="glass-recessed px-3 py-2 rounded-xl flex items-center gap-2 min-w-[100px] ring-1 ring-ember/50">
                    <Navigation className="w-3.5 h-3.5 text-ember shrink-0" />
                    <input
                      type="text"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editValue) {
                          handleSetHeading(editValue, today)
                          setEditingStat(null)
                          setEditValue('')
                        } else if (e.key === 'Escape') {
                          setEditingStat(null)
                          setEditValue('')
                        }
                      }}
                      onBlur={() => {
                        if (editValue) handleSetHeading(editValue, today)
                        setEditingStat(null)
                        setEditValue('')
                      }}
                      className="bg-transparent text-bone text-sm w-24 focus:outline-none"
                      placeholder="Focus..."
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingStat('heading')
                      setEditValue(todayHeading ? todayHeading.intention : '')
                    }}
                    className="glass-recessed px-4 py-2 rounded-xl flex flex-col items-center gap-0.5 min-w-[90px] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-ember" />
                      <span className="font-mono text-base text-bone font-semibold truncate max-w-[60px]">
                        {todayHeading ? '✓' : '--'}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone">heading</span>
                  </button>
                )}
              </motion.div>

              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ModeToggle mode={mode} onToggle={() => setMode(mode === 'view' ? 'log' : 'view')} />
                <div className="text-right hidden sm:block">
                  <p className="text-fog text-sm">{getGreeting()},</p>
                  <p className="font-display text-lg text-bone font-semibold">
                    {user?.email?.split('@')[0] || userName}
                  </p>
                </div>
                {isConfigured && user && (
                  <button
                    onClick={() => signOut()}
                    className="p-2 rounded-lg text-fog hover:text-bone hover:bg-white/5 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-4">
          <div className="glass-main p-6">
          <AnimatePresence mode="wait">
          {mode === 'log' ? (
            /* ==================== LOG MODE ==================== */
            <motion.div
              key="log-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Today's Heading */}
              <div className="mb-6">
                <h2 className="text-xs text-stone uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-ember" />
                  Today's Heading
                </h2>
                <input
                  type="text"
                  value={todayHeading?.intention ?? ''}
                  onChange={(e) => handleSetHeading(e.target.value, today)}
                  placeholder="What's your focus for today?"
                  className="input w-full"
                />
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {/* Calories Input */}
                <div className="glass-recessed rounded-xl p-4">
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-ember" />
                    Calories
                  </label>
                  <input
                    type="number"
                    value={todayCalories?.calories ?? ''}
                    onChange={(e) => e.target.value && handleLogCalories(e.target.value, today)}
                    placeholder="0"
                    className="bg-transparent w-full font-mono text-2xl text-bone focus:outline-none"
                  />
                  {calorieGoal && (
                    <p className="text-xs text-stone mt-1">Goal: {calorieGoal.toLocaleString()}</p>
                  )}
                </div>

                {/* Weight Input */}
                <div className="glass-recessed rounded-xl p-4">
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5 text-fjord" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={todayWeight?.weight ?? ''}
                    onChange={(e) => e.target.value && handleLogWeight(e.target.value, today)}
                    placeholder="0.0"
                    className="bg-transparent w-full font-mono text-2xl text-bone focus:outline-none"
                  />
                  {weightGoal && (
                    <p className="text-xs text-stone mt-1">Goal: {weightGoal} kg</p>
                  )}
                </div>

                {/* Streak Display */}
                <div className="glass-recessed rounded-xl p-4">
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-victory-green" />
                    Streak
                  </label>
                  <p className="font-mono text-2xl text-victory-green">{Math.max(calorieStreak, habitStreak)}</p>
                  <p className="text-xs text-stone mt-1">days</p>
                </div>

                {/* Habits Progress */}
                <div className="glass-recessed rounded-xl p-4">
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-victory-green" />
                    Habits
                  </label>
                  <p className="font-mono text-2xl">
                    <span className="text-victory-green">{completedHabits}</span>
                    <span className="text-stone">/{activeHabits.length}</span>
                  </p>
                  <p className="text-xs text-stone mt-1">completed</p>
                </div>
              </div>

              {/* Habits Checklist */}
              <div className="glass rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm text-bone font-semibold flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-victory-green" />
                    Today's Habits
                  </h2>
                  <button
                    onClick={() => setShowHabitModal(true)}
                    className="text-xs text-stone hover:text-fog transition-colors"
                  >
                    Manage
                  </button>
                </div>

                {activeHabits.length > 0 ? (
                  <div className="space-y-2">
                    {activeHabits.map(habit => {
                      const isComplete = todayHabitLogs.find(l => l.habit_id === habit.id)?.completed
                      return (
                        <button
                          key={habit.id}
                          onClick={() => toggleHabit(habit.id)}
                          className={`habit-item w-full ${isComplete ? 'complete' : ''}`}
                        >
                          <div className={`habit-checkbox ${isComplete ? 'checked' : ''}`}>
                            {isComplete && (
                              <motion.svg
                                viewBox="0 0 24 24"
                                className="w-3 h-3 text-forge-black"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                              </motion.svg>
                            )}
                          </div>
                          <span className={`text-sm ${isComplete ? 'text-stone line-through' : 'text-bone'}`}>
                            {habit.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-stone text-sm text-center py-4">No habits set up yet</p>
                )}

                {/* Add habit inline */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-iron-slate/50">
                  <input
                    type="text"
                    placeholder="Add new habit..."
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newHabitName.trim()) {
                        handleAddHabit(newHabitName.trim())
                        setNewHabitName('')
                      }
                    }}
                    className="glass-recessed px-3 py-2 rounded-lg text-sm text-bone placeholder-stone flex-1 focus:outline-none focus:ring-1 focus:ring-victory-green/50"
                  />
                  {newHabitName.trim() && (
                    <button
                      onClick={() => {
                        handleAddHabit(newHabitName.trim())
                        setNewHabitName('')
                      }}
                      className="p-2 rounded-lg bg-victory-green/20 text-victory-green hover:bg-victory-green/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Message & Reflection Row */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Message in a Bottle */}
                <div className="glass rounded-xl p-4">
                  <h2 className="text-sm text-bone font-semibold flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-ember" />
                    Message in a Bottle
                  </h2>
                  <button
                    onClick={() => setShowWriteMessageModal(true)}
                    className="w-full py-3 rounded-lg border border-dashed border-iron-slate text-stone hover:text-bone hover:border-ember/50 transition-all text-sm"
                  >
                    Write a message to your future self...
                  </button>
                </div>

                {/* Bearing / Reflection */}
                <div className="glass rounded-xl p-4">
                  <h2 className="text-sm text-bone font-semibold flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-fjord" />
                    Bearing Check
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setBearingType('weekly'); setShowBearingModal(true) }}
                      className="flex-1 py-3 rounded-lg border border-dashed border-iron-slate text-stone hover:text-bone hover:border-fjord/50 transition-all text-sm"
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => { setBearingType('monthly'); setShowBearingModal(true) }}
                      className="flex-1 py-3 rounded-lg border border-dashed border-iron-slate text-stone hover:text-bone hover:border-fjord/50 transition-all text-sm"
                    >
                      Monthly
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ==================== VIEW MODE ==================== */
            <motion.div
              key="view-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
          {/* Today's Heading Display */}
          {todayHeading && (
          <motion.section
            className="mb-4 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
              <div className="glass-recessed px-3 py-2 rounded-lg flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-ember shrink-0" />
                <span className="text-xs text-stone">Heading:</span>
                <p className="text-sm text-bone font-medium truncate">
                  {todayHeading.intention}
                </p>
              </div>
          </motion.section>
          )}


          {/* Stats Summary Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            <div className="glass-recessed rounded-xl p-3 text-center">
              <p className="text-[10px] text-stone uppercase mb-1">Streak</p>
              <p className="font-mono text-xl text-ember">{Math.max(calorieStreak, habitStreak)}</p>
              <p className="text-[10px] text-stone">days</p>
            </div>
            <div className="glass-recessed rounded-xl p-3 text-center">
              <p className="text-[10px] text-stone uppercase mb-1">Calories</p>
              <p className="font-mono text-xl text-bone">{todayCalories?.calories?.toLocaleString() ?? '--'}</p>
              <p className="text-[10px] text-stone">{calorieGoal ? `/ ${calorieGoal.toLocaleString()}` : 'today'}</p>
            </div>
            <div className="glass-recessed rounded-xl p-3 text-center">
              <p className="text-[10px] text-stone uppercase mb-1">Weight</p>
              <p className="font-mono text-xl text-bone">{latestWeight?.weight ?? '--'}</p>
              <p className="text-[10px] text-stone">kg {weightTrend === 'down' ? '↓' : weightTrend === 'up' ? '↑' : ''}</p>
            </div>
            <div className="glass-recessed rounded-xl p-3 text-center">
              <p className="text-[10px] text-stone uppercase mb-1">Habits</p>
              <p className="font-mono text-xl">
                <span className="text-victory-green">{completedHabits}</span>
                <span className="text-stone">/{activeHabits.length}</span>
              </p>
              <p className="text-[10px] text-stone">today</p>
            </div>
            <div className="glass-recessed rounded-xl p-3 text-center col-span-2 lg:col-span-1">
              <p className="text-[10px] text-stone uppercase mb-1">7d Avg</p>
              <p className="font-mono text-xl text-fjord">{rollingAverage ?? '--'}</p>
              <p className="text-[10px] text-stone">kg</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            {/* Weight Chart */}
            <div className="glass p-4">
              <WeightChart weights={weights} goal={weightGoal} onLoadSample={loadSampleWeightData} onLogWeight={() => { setMode('log') }} className="h-[200px]" />
            </div>

            {/* Calorie Chart */}
            <div className="glass p-4">
              <CalorieChart calories={calories} goal={calorieGoal} />
            </div>
          </div>

          {/* Habit Chart */}
          <div className="glass p-4 mb-4">
            <HabitChart habitLogs={habitLogs} habits={habits} />
          </div>

          {/* Insights Section */}
          <section className="max-w-2xl">
            {/* Insights Card */}
            <DirectionCard title="Insights" icon={TrendingUp} delay={0.25}>
              <div className="space-y-4">
                <p className="text-fog text-sm">
                  Patterns and correlations from your data.
                </p>
                <InsightsCard
                  calories={calories}
                  weights={weights}
                  habitLogs={habitLogs}
                  habits={habits}
                  calorieGoal={calorieGoal}
                />
              </div>
            </DirectionCard>
          </section>
            </motion.div>
          )}
          </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Modals */}
      <QuickLogModal
        isOpen={modalType === 'calories'}
        onClose={() => setModalType(null)}
        type="calories"
        onSubmit={handleLogCalories}
      />
      <QuickLogModal
        isOpen={modalType === 'weight'}
        onClose={() => setModalType(null)}
        type="weight"
        onSubmit={handleLogWeight}
      />
      <QuickLogModal
        isOpen={modalType === 'heading'}
        onClose={() => setModalType(null)}
        type="heading"
        onSubmit={handleSetHeading}
      />
      <WeightGoalModal
        isOpen={showWeightGoalModal}
        onClose={() => setShowWeightGoalModal(false)}
        currentGoal={weightGoal}
        onSubmit={handleSetWeightGoal}
      />
      <WriteMessageModal
        isOpen={showWriteMessageModal}
        onClose={() => setShowWriteMessageModal(false)}
        onSubmit={handleAddMessage}
      />
      <HabitManagementModal
        isOpen={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        habits={habits}
        onAdd={handleAddHabit}
        onEdit={handleEditHabit}
        onDelete={handleDeleteHabit}
        onToggleActive={handleToggleHabitActive}
      />
      <CalorieGoalModal
        isOpen={showCalorieGoalModal}
        onClose={() => setShowCalorieGoalModal(false)}
        currentGoal={calorieGoal}
        onSubmit={handleSetCalorieGoal}
      />
      <BearingModal
        isOpen={showBearingModal}
        onClose={() => setShowBearingModal(false)}
        onSubmit={handleSaveBearing}
        type={bearingType}
        periodStart={bearingType === 'weekly' ? currentWeekBounds.start : currentMonthBounds.start}
        periodEnd={bearingType === 'weekly' ? currentWeekBounds.end : currentMonthBounds.end}
        existingBearing={bearingType === 'weekly' ? currentWeekBearing : currentMonthBearing}
      />
      <TrueNorthModal
        isOpen={showTrueNorthModal}
        onClose={() => {
          setShowTrueNorthModal(false)
          setEditingGoal(undefined)
        }}
        onSubmit={handleAddLifeGoal}
        existingGoal={editingGoal}
      />
      <WaypointModal
        isOpen={showWaypointModal}
        onClose={() => setShowWaypointModal(false)}
        onSubmit={handleAddWaypoint}
        lifeGoals={lifeGoals}
      />
    </div>
  )
}
