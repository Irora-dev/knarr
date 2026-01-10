'use client'

import { useState, useEffect, useCallback } from 'react'
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
  LogOut,
  Settings,
  Trash2,
  RefreshCw,
  User,
  Sun,
  Moon,
  Coffee,
  Pill,
  Beaker,
  Clock,
  AlertTriangle,
  Zap,
  BedDouble,
  Utensils,
  Info,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  Wallet,
  Repeat,
  Tag,
  ShoppingCart,
  GraduationCap
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import { useKnarrData } from '../lib/useKnarrData'
import { AuthScreen } from '../components/AuthScreen'
import { OnboardingFlow } from '../components/OnboardingFlow'
import { Tutorial, TutorialStep } from '../components/Tutorial'
import { SettingsModal } from '../components/SettingsModal'
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
  ComposedChart,
  Bar,
  BarChart
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

interface Task {
  id: string
  name: string
  scheduled_date: string | null  // YYYY-MM-DD or null for "today"
  completed: boolean
  completed_at: string | null    // timestamp for animation timing
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly'
  priority: 'low' | 'medium' | 'high' | null
  category: 'work' | 'personal' | 'health' | 'finance' | 'errands' | 'learning' | null
  created_at: string
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

interface FinanceAccount {
  id: string
  name: string
  type: 'cash' | 'checking' | 'savings' | 'investment' | 'crypto' | 'property' | 'debt' | 'other'
  balance: number
  currency: string
  institution?: string
  notes?: string
  is_asset: boolean
  last_updated: string
  created_at: string
}

interface NetWorthSnapshot {
  id: string
  date: string
  total_assets: number
  total_liabilities: number
  net_worth: number
  breakdown: {
    account_id: string
    name: string
    type: string
    balance: number
  }[]
  created_at: string
}

// Dopamine Routine Types
type RoutinePhase = 'morning' | 'deepwork' | 'dinner' | 'sleep' | 'rescue'

interface SupplementItem {
  id: string
  name: string
  dosage: string
  measurement?: string
  effect: string
  details: string
  warning?: string
  optional?: boolean
  substituteFor?: string
}

interface RoutinePhaseData {
  id: RoutinePhase
  title: string
  subtitle: string
  time: string
  goal: string
  icon: typeof Sun
  color: string
  bgColor: string
  items: SupplementItem[]
  protocolRule?: string
  environment?: string[]
  trigger?: string
  limit?: string
}

// Dopamine Routine Data
const DOPAMINE_ROUTINE: RoutinePhaseData[] = [
  {
    id: 'morning',
    title: 'Morning Activation',
    subtitle: 'Phase 1',
    time: '15–30 min post-waking',
    goal: 'Wake up brain without spiking anxiety',
    icon: Sun,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/20',
    protocolRule: 'No phone/screens for the first 60 minutes',
    items: [
      {
        id: 'whey',
        name: 'Whey Protein',
        dosage: '1 Scoop',
        measurement: '~3 Heaping Tablespoons if no scoop',
        effect: 'Stabilizes blood sugar',
        details: 'Mix in shaker with water/milk as part of the Neuro-Breakfast Shake. Provides sustained energy and prevents blood sugar crashes that can trigger anxiety.',
      },
      {
        id: 'creatine',
        name: 'Creatine',
        dosage: '5g',
        measurement: '1 Full Teaspoon',
        effect: 'Mental endurance',
        details: 'Add to shake. Creatine supports ATP production in the brain, enhancing cognitive function and mental stamina throughout the day.',
      },
      {
        id: 'taurine-morning',
        name: 'Taurine',
        dosage: '1g',
        measurement: '1/4 Teaspoon (tip of spoon)',
        effect: 'Calms nervous system startle response',
        details: 'Add to shake. Taurine is an amino acid that helps regulate GABA, reducing the "jumpy" feeling and nervous system over-reactivity.',
      },
      {
        id: 'alcar',
        name: 'ALCAR (Acetyl L-Carnitine)',
        dosage: '1 Capsule (500mg)',
        effect: 'Clears brain fog & scattered thoughts',
        details: 'Take with shake. ALCAR crosses the blood-brain barrier and supports acetylcholine production, the neurotransmitter responsible for focus and memory.',
      },
      {
        id: 'rhodiola',
        name: 'Rhodiola Rosea',
        dosage: '1 Capsule',
        effect: 'Prevents burnout & fatigue',
        details: 'Adaptogenic herb that helps the body resist physical, chemical, and biological stressors. Particularly effective for preventing the afternoon crash.',
        optional: true,
      },
    ],
  },
  {
    id: 'deepwork',
    title: 'Deep Work Block',
    subtitle: 'Phase 2',
    time: '90 min post-waking',
    goal: 'Achieve flow state',
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    environment: ['Phone in another room', 'Earplugs in (if noisy)'],
    items: [
      {
        id: 'taurine-work',
        name: 'Taurine (Optional Booster)',
        dosage: '0.5g – 1g',
        measurement: 'Sip in water',
        effect: 'Reduces physical anxiety',
        details: 'Use if you feel physical anxiety or "chest buzzing" during work. Taurine helps calm the physical manifestations of stress without sedating you.',
        optional: true,
      },
    ],
  },
  {
    id: 'dinner',
    title: 'Cortisol Cutoff',
    subtitle: 'Phase 3',
    time: 'With dinner (last meal)',
    goal: 'Blunt stress response for sleep prep',
    icon: Utensils,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/20',
    items: [
      {
        id: 'phosphatidylserine',
        name: 'Phosphatidylserine',
        dosage: '1 Capsule (150mg)',
        effect: 'Blunts physical stress & cortisol spikes',
        details: 'Take with dinner. PS is a phospholipid that helps regulate cortisol, particularly effective at reducing elevated evening cortisol that can interfere with sleep.',
      },
      {
        id: 'ashwagandha',
        name: 'Ashwagandha',
        dosage: '1 Capsule',
        effect: 'Lowers serum cortisol',
        details: 'Take with dinner. This adaptogenic herb has been shown to reduce cortisol levels by up to 30%. If you have Stress Care bottle, take that INSTEAD.',
        warning: 'If you have the Stress Care bottle, take that INSTEAD of Ashwagandha.',
      },
    ],
  },
  {
    id: 'sleep',
    title: 'GABA Restoration',
    subtitle: 'Phase 4',
    time: '45 min before sleep',
    goal: 'Deep sleep & temperature regulation',
    icon: Moon,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-400/20',
    protocolRule: 'No screens 90 minutes before bed',
    items: [
      {
        id: 'magnesium',
        name: 'Magnesium Bisglycinate',
        dosage: '~400mg elemental',
        measurement: '1/2 Flat Teaspoon (Silver Bag)',
        effect: 'Relaxation & temperature regulation',
        details: 'Mix in small cup of water as "Sleep Mocktail". Magnesium glycinate is the most bioavailable form and promotes GABA activity for calming effects.',
      },
      {
        id: 'glycine',
        name: 'Glycine',
        dosage: '3g–5g',
        measurement: '1 Heaping Teaspoon',
        effect: 'Enhances sleep quality',
        details: 'Add to Sleep Mocktail. Glycine lowers core body temperature and increases time spent in REM sleep. Also supports liver detoxification overnight.',
      },
      {
        id: 'apigenin',
        name: 'Apigenin',
        dosage: '1 Capsule',
        effect: 'Natural sedative from chamomile',
        details: 'Take with Sleep Mocktail. Apigenin binds to GABA receptors similarly to benzodiazepines but without the side effects or dependency risk.',
        optional: true,
      },
    ],
  },
  {
    id: 'rescue',
    title: 'Rescue Protocols',
    subtitle: 'Non-Daily',
    time: 'As needed',
    goal: 'Emergency sedation for panic/insomnia',
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    trigger: 'Physical shaking, severe anxiety, or "wired but tired" crash',
    limit: 'Max 2x per week for Valerian',
    items: [
      {
        id: 'valerian',
        name: 'Valerian Root (Panic Button)',
        dosage: '1 Capsule',
        effect: 'Emergency sedation',
        details: 'Take 1 hour before bed when experiencing severe anxiety or panic. Valerian works on GABA receptors to produce a strong calming effect.',
        warning: 'Do not drive. Do not combine with alcohol. Max 2x per week.',
      },
      {
        id: 'chelated-mag',
        name: 'Chelated Magnesium (Travel Backup)',
        dosage: '2–3 Capsules',
        effect: 'Substitute for powder when traveling',
        details: 'Use when traveling or too tired to mix powders. The black bottle capsules are a convenient alternative to the powder form.',
        substituteFor: 'Magnesium Powder',
      },
    ],
  },
]

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

// Streak calculation with grace day recovery (1 day forgiveness)
interface StreakResult {
  count: number
  graceDayUsed: boolean
  recentDays: { date: string; logged: boolean; isGraceDay: boolean }[]
}

function calculateStreakWithGrace(
  loggedDates: Set<string>,
  maxDaysToCheck: number = 30
): StreakResult {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]!

  let streak = 0
  let graceDayUsed = false
  let missedDays = 0
  const recentDays: { date: string; logged: boolean; isGraceDay: boolean }[] = []

  // Check if today is logged
  const todayLogged = loggedDates.has(todayStr)

  // Add today to recent days
  recentDays.push({
    date: todayStr,
    logged: todayLogged,
    isGraceDay: false
  })

  if (todayLogged) {
    streak = 1
  }

  // Now check backwards from yesterday
  for (let i = 1; i < maxDaysToCheck; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]!
    const logged = loggedDates.has(dateStr)

    if (logged) {
      streak++
      recentDays.push({
        date: dateStr,
        logged: true,
        isGraceDay: false
      })
      missedDays = 0 // Reset consecutive missed days
    } else {
      missedDays++

      // Allow 1 grace day - only if we already have a streak going
      if (missedDays === 1 && !graceDayUsed && streak > 0) {
        // Look ahead to see if there's a logged day after this gap
        const dayBeforeGap = new Date(checkDate)
        dayBeforeGap.setDate(dayBeforeGap.getDate() - 1)
        const dayBeforeGapStr = dayBeforeGap.toISOString().split('T')[0]!

        if (loggedDates.has(dayBeforeGapStr)) {
          graceDayUsed = true
          recentDays.push({
            date: dateStr,
            logged: false,
            isGraceDay: true
          })
          // Continue - don't count grace day in streak number
          continue
        }
      }

      // If we haven't started a real streak yet, just skip
      if (streak === 0) {
        recentDays.push({
          date: dateStr,
          logged: false,
          isGraceDay: false
        })
        break
      }

      // More than 1 consecutive day missed - streak ends
      if (missedDays > 1) {
        recentDays.push({
          date: dateStr,
          logged: false,
          isGraceDay: false
        })
        break
      }

      recentDays.push({
        date: dateStr,
        logged: false,
        isGraceDay: false
      })
      break
    }
  }

  return {
    count: streak,
    graceDayUsed,
    recentDays: recentDays.slice(0, 14) // Limit to 14 days for display
  }
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

// Anchor Streak Bar Component - Premium streak display at top of content
function AnchorStreakBar({ streakData }: { streakData: StreakResult }) {
  const { count, graceDayUsed, recentDays } = streakData

  // Show last 7 days in reverse order (most recent first, display left to right)
  const displayDays = recentDays.slice(0, 7).reverse()

  return (
    <motion.div
      className="anchor-streak-bar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Anchor + Streak Count */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="anchor-icon-container">
              <Anchor className="w-4 h-4 sm:w-5 sm:h-5 text-fjord" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-xl sm:text-2xl font-bold text-ember">{count}</span>
              <span className="text-xs sm:text-sm text-fog">day streak</span>
            </div>
            {graceDayUsed && (
              <motion.div
                className="grace-day-badge"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                title="Your streak was saved! One grace day was used."
              >
                <span className="text-[10px] sm:text-xs text-victory-green font-medium">Anchored</span>
              </motion.div>
            )}
          </div>

          {/* Right: Day chain visualization */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {displayDays.map((day, index) => {
              const dayLabel = new Date(day.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).charAt(0)
              return (
                <div key={day.date} className="flex flex-col items-center gap-0.5">
                  <motion.div
                    className={`streak-day-dot ${
                      day.logged ? 'logged' :
                      day.isGraceDay ? 'grace' :
                      'missed'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    title={
                      day.isGraceDay
                        ? `${formatShortDate(day.date)} - Grace day (streak saved!)`
                        : day.logged
                        ? `${formatShortDate(day.date)} - Logged`
                        : `${formatShortDate(day.date)} - No log`
                    }
                  >
                    {day.isGraceDay && (
                      <Anchor className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-fjord" />
                    )}
                  </motion.div>
                  <span className="text-[8px] sm:text-[10px] text-stone hidden sm:block">{dayLabel}</span>
                </div>
              )
            })}
            {count > 7 && (
              <span className="text-[10px] sm:text-xs text-stone ml-1">+{count - 7}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
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

// Calorie Chart Component
function CalorieChart({
  calories,
  goal,
  className,
  onLoadSample
}: {
  calories: CalorieLog[]
  goal: number | null
  className?: string
  onLoadSample?: () => void
}) {
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
  className,
  onLoadSample
}: {
  habitLogs: HabitLog[]
  habits: Habit[]
  className?: string
  onLoadSample?: () => void
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

// Task Chart Component
function TaskChart({
  tasks,
  className
}: {
  tasks: Task[]
  className?: string
}) {
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-5 sm:p-8 w-full max-w-md relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-5 sm:p-8 w-full max-w-md relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-5 sm:p-8 w-full max-w-lg relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
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

// Message Delivery Popup Component
function MessageDeliveryModal({
  isOpen,
  message,
  onClose,
  onMarkRead,
  unreadCount
}: {
  isOpen: boolean
  message: Message | null
  onClose: () => void
  onMarkRead: (id: string) => void
  unreadCount: number
}) {
  if (!message) return null

  const moodEmojis: Record<string, string> = {
    hopeful: '🌅',
    grateful: '🙏',
    determined: '⚔️',
    reflective: '🌊',
  }

  const moodLabels: Record<string, string> = {
    hopeful: 'Hopeful',
    grateful: 'Grateful',
    determined: 'Determined',
    reflective: 'Reflective',
  }

  const createdDate = new Date(message.created_at)
  const deliveredDate = new Date(message.deliver_at)
  const daysInTransit = Math.floor((deliveredDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

  const handleClose = () => {
    onMarkRead(message.id)
    onClose()
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
            className="absolute inset-0 bg-forge-black/80 backdrop-blur-md"
            onClick={handleClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          >
            {/* Floating bottle animation */}
            <motion.div
              className="flex justify-center mb-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fjord/30 to-fjord/10 flex items-center justify-center border border-fjord/30 shadow-lg shadow-fjord/20">
                <Mail className="w-10 h-10 text-fjord" />
              </div>
            </motion.div>

            <div className="glass-modal p-6 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">{message.mood ? moodEmojis[message.mood] : '📜'}</span>
                <h2 className="font-display text-xl text-bone">Message Arrived</h2>
              </div>

              <p className="text-sm text-stone mb-4">
                Sent {daysInTransit} {daysInTransit === 1 ? 'day' : 'days'} ago
                {message.mood && ` • Feeling ${moodLabels[message.mood]?.toLowerCase()}`}
              </p>

              <div className="glass-recessed p-4 rounded-lg mb-4 text-left">
                <p className="text-fog leading-relaxed italic">"{message.content}"</p>
              </div>

              <p className="text-xs text-stone mb-4">— You, from the past</p>

              <button
                onClick={handleClose}
                className="btn-primary w-full"
              >
                {unreadCount > 1 ? `Continue (${unreadCount - 1} more)` : 'Close'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Notification Dot Indicator
function NotificationDot({ className = '' }: { className?: string }) {
  return (
    <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-ember rounded-full animate-pulse ${className}`} />
  )
}

// Weekly Bearing Notification Popup
function BearingNotificationPopup({
  isOpen,
  onClose,
  onFillOut,
  periodStart,
  periodEnd
}: {
  isOpen: boolean
  onClose: () => void
  onFillOut: () => void
  periodStart: string
  periodEnd: string
}) {
  const formatPeriodDisplay = () => {
    const start = new Date(periodStart + 'T00:00:00')
    const end = new Date(periodEnd + 'T00:00:00')
    return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
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
            className="absolute inset-0 bg-forge-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          >
            {/* Floating compass animation */}
            <motion.div
              className="flex justify-center mb-4"
              animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ember/30 to-ember/10 flex items-center justify-center border border-ember/30 shadow-lg shadow-ember/20">
                <CompassIcon className="w-10 h-10 text-ember" />
              </div>
            </motion.div>

            <div className="glass-modal p-6 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">🧭</span>
                <h2 className="font-display text-xl text-bone">Time to Reflect</h2>
              </div>

              <p className="text-sm text-stone mb-2">
                Your weekly bearing is due
              </p>

              <div className="glass-recessed px-3 py-2 rounded-lg mb-4 inline-block">
                <span className="text-xs text-fjord font-medium">{formatPeriodDisplay()}</span>
              </div>

              <p className="text-fog text-sm mb-6 leading-relaxed">
                Take a moment to reflect on your wins, challenges, and lessons from this week.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={onFillOut}
                  className="btn-primary w-full"
                >
                  Fill Out Now
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-stone hover:text-fog transition-colors"
                >
                  Remind Me Later
                </button>
              </div>
            </div>
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-5 sm:p-8 w-full max-w-lg relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-5 sm:p-8 w-full max-w-lg relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-5 sm:p-8 w-full max-w-md relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
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
            className="glass-modal p-5 sm:p-8 w-full max-w-md relative z-10 mx-2 sm:mx-0"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-ember/20 flex items-center justify-center">
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-ember" />
                </div>
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-semibold">{config[type].title}</h2>
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

// Finance account type configuration
const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash', icon: DollarSign, is_asset: true },
  { value: 'checking', label: 'Checking', icon: DollarSign, is_asset: true },
  { value: 'savings', label: 'Savings', icon: DollarSign, is_asset: true },
  { value: 'investment', label: 'Investment', icon: TrendingUp, is_asset: true },
  { value: 'crypto', label: 'Crypto', icon: DollarSign, is_asset: true },
  { value: 'property', label: 'Property', icon: DollarSign, is_asset: true },
  { value: 'debt', label: 'Debt/Loan', icon: TrendingDown, is_asset: false },
  { value: 'other', label: 'Other', icon: DollarSign, is_asset: true },
] as const

// Finance Setup Modal (for encryption key)
function FinanceSetupModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (key: string) => void
}) {
  const [key, setKey] = useState('')
  const [confirmKey, setConfirmKey] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setKey('')
      setConfirmKey('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (key.length < 8) {
      setError('PIN must be at least 8 characters')
      return
    }
    if (key !== confirmKey) {
      setError('PINs do not match')
      return
    }
    onSubmit(key)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-5 sm:p-8 w-full max-w-md relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-victory-green/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-victory-green" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Finance Setup</h2>
                  <p className="text-fog text-sm">Create your encryption PIN</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="glass-recessed rounded-lg p-4 mb-4">
              <p className="text-sm text-fog">
                Your financial data is encrypted with a PIN that only you know.
                This PIN never leaves your device - if you forget it, your data cannot be recovered.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                    Create PIN (8+ characters)
                  </label>
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter your PIN"
                    className="input w-full"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    value={confirmKey}
                    onChange={(e) => setConfirmKey(e.target.value)}
                    placeholder="Confirm your PIN"
                    className="input w-full"
                  />
                </div>
              </div>

              {error && (
                <p className="text-blood-red text-sm mt-3">{error}</p>
              )}

              <button type="submit" className="btn-primary w-full mt-6">
                Enable Finance Tracking
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Finance Account Modal (add/edit)
function FinanceAccountModal({
  isOpen,
  onClose,
  onSubmit,
  existingAccount,
  onDelete,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (account: Omit<FinanceAccount, 'id' | 'created_at'>) => void
  existingAccount?: FinanceAccount | null
  onDelete?: () => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<FinanceAccount['type']>('checking')
  const [balance, setBalance] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [institution, setInstitution] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isOpen && existingAccount) {
      setName(existingAccount.name)
      setType(existingAccount.type)
      setBalance(existingAccount.balance.toString())
      setCurrency(existingAccount.currency)
      setInstitution(existingAccount.institution || '')
      setNotes(existingAccount.notes || '')
    } else if (isOpen) {
      setName('')
      setType('checking')
      setBalance('')
      setCurrency('USD')
      setInstitution('')
      setNotes('')
    }
  }, [isOpen, existingAccount])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !balance) return

    const accountType = ACCOUNT_TYPES.find(t => t.value === type)

    onSubmit({
      name: name.trim(),
      type,
      balance: parseFloat(balance),
      currency,
      institution: institution.trim() || undefined,
      notes: notes.trim() || undefined,
      is_asset: accountType?.is_asset ?? true,
      last_updated: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-5 sm:p-8 w-full max-w-md relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-victory-green/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-victory-green" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {existingAccount ? 'Edit Account' : 'Add Account'}
                  </h2>
                  <p className="text-fog text-sm">Track your assets & liabilities</p>
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
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Main Checking"
                    className="input w-full"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                    Account Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ACCOUNT_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value as FinanceAccount['type'])}
                        className={`p-2 rounded-lg text-xs font-medium transition-all ${
                          type === t.value
                            ? t.is_asset
                              ? 'bg-victory-green/20 text-victory-green border border-victory-green/30'
                              : 'bg-blood-red/20 text-blood-red border border-blood-red/30'
                            : 'glass-recessed text-fog hover:text-bone'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                      Balance
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      placeholder="0.00"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="input w-full"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                    Institution (optional)
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Chase Bank"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes..."
                    className="input w-full resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full mt-6">
                {existingAccount ? 'Update Account' : 'Add Account'}
              </button>

              {existingAccount && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="w-full mt-3 py-2 text-blood-red hover:text-blood-red/80 text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Supplement Detail Modal
function SupplementDetailModal({
  isOpen,
  onClose,
  supplement,
  phaseColor,
  phaseBgColor,
}: {
  isOpen: boolean
  onClose: () => void
  supplement: SupplementItem | null
  phaseColor: string
  phaseBgColor: string
}) {
  if (!supplement) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-5 sm:p-8 w-full max-w-md relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${phaseBgColor} flex items-center justify-center shrink-0`}>
                  <Pill className={`w-5 h-5 ${phaseColor}`} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-bone">{supplement.name}</h2>
                  <p className={`text-sm ${phaseColor}`}>{supplement.effect}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dosage Info */}
            <div className="glass-recessed rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Beaker className="w-4 h-4 text-fog" />
                <span className="text-xs text-stone uppercase tracking-wider">Dosage</span>
              </div>
              <p className="text-lg font-mono text-bone">{supplement.dosage}</p>
              {supplement.measurement && (
                <p className="text-sm text-fog mt-1">{supplement.measurement}</p>
              )}
            </div>

            {/* How It Works */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-fog" />
                <span className="text-xs text-stone uppercase tracking-wider">How It Works</span>
              </div>
              <p className="text-sm text-fog leading-relaxed">{supplement.details}</p>
            </div>

            {/* Substitute Info */}
            {supplement.substituteFor && (
              <div className="glass-recessed rounded-lg p-3 mb-4 border border-fjord/30">
                <p className="text-sm text-fjord">
                  <span className="font-medium">Substitute for:</span> {supplement.substituteFor}
                </p>
              </div>
            )}

            {/* Warning */}
            {supplement.warning && (
              <div className="rounded-lg p-3 mb-4 bg-blood-red/10 border border-blood-red/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blood-red shrink-0 mt-0.5" />
                  <p className="text-sm text-blood-red">{supplement.warning}</p>
                </div>
              </div>
            )}

            {/* Optional Badge */}
            {supplement.optional && (
              <div className="flex items-center gap-2 text-sm text-stone">
                <Sparkles className="w-4 h-4" />
                <span>This supplement is optional based on availability</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="btn-primary w-full mt-6"
            >
              Got It
            </button>
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
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'routine', label: 'Routine', icon: Zap },
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

  // Data from hook (supports both localStorage and Supabase)
  const {
    isLoading: dataLoading,
    dataLoaded,
    useSupabase,
    calories,
    weights,
    habits,
    habitLogs,
    tasks,
    headings,
    messages,
    bearings,
    lifeGoals,
    waypoints,
    userName,
    weightGoal,
    calorieGoal,
    addCalorie,
    addWeight,
    deleteWeight,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitLog,
    addTask,
    completeTask,
    deleteTask,
    setHeading,
    addMessage,
    markMessageRead,
    addBearing,
    addLifeGoal,
    updateLifeGoal,
    deleteLifeGoal,
    addWaypoint,
    deleteWaypoint,
    setUserName,
    setWeightGoal,
    setCalorieGoal,
    getOnboardingComplete,
    setOnboardingComplete,
    getTutorialComplete,
    setTutorialComplete,
    clearAllData,
    // Finance data and operations
    financeAccounts,
    financeTransactions,
    netWorthSnapshots,
    financeEncryptionKey,
    setFinanceEncryptionKey,
    hasFinanceKey,
    addFinanceAccount,
    updateFinanceAccount,
    deleteFinanceAccount,
    addFinanceTransaction,
    deleteFinanceTransaction,
    takeNetWorthSnapshot,
  } = useKnarrData()

  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<'view' | 'log'>('view')
  const [selectedLogDate, setSelectedLogDate] = useState<string>(getTodayString())
  const [modalType, setModalType] = useState<'calories' | 'weight' | 'heading' | null>(null)
  const [showWeightGoalModal, setShowWeightGoalModal] = useState(false)
  const [showWriteMessageModal, setShowWriteMessageModal] = useState(false)
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [activeTab, setActiveTab] = useState<DirectionTab>('overview')
  const [showCalorieGoalModal, setShowCalorieGoalModal] = useState(false)
  const [showBearingModal, setShowBearingModal] = useState(false)
  const [bearingType, setBearingType] = useState<'weekly' | 'monthly'>('weekly')
  const [showTrueNorthModal, setShowTrueNorthModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<LifeGoal | undefined>(undefined)
  const [showWaypointModal, setShowWaypointModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Finance state
  const [showFinanceSetupModal, setShowFinanceSetupModal] = useState(false)
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<FinanceAccount | null>(null)
  const [financeSetupKey, setFinanceSetupKey] = useState('')

  // Dopamine Routine state
  const [activeRoutinePhase, setActiveRoutinePhase] = useState<RoutinePhase | 'all'>('all')
  const [expandedPhases, setExpandedPhases] = useState<Set<RoutinePhase>>(new Set())
  const [selectedSupplement, setSelectedSupplement] = useState<SupplementItem | null>(null)
  const [selectedSupplementPhase, setSelectedSupplementPhase] = useState<RoutinePhaseData | null>(null)
  const [showSupplementModal, setShowSupplementModal] = useState(false)

  const togglePhaseExpanded = (phaseId: RoutinePhase) => {
    setExpandedPhases(prev => {
      const next = new Set(prev)
      if (next.has(phaseId)) {
        next.delete(phaseId)
      } else {
        next.add(phaseId)
      }
      return next
    })
  }

  // Message delivery popup state
  const [showMessagePopup, setShowMessagePopup] = useState(false)
  const [currentDeliveredMessage, setCurrentDeliveredMessage] = useState<Message | null>(null)
  const [hasCheckedMessages, setHasCheckedMessages] = useState(false)

  // Bearing notification state
  const [showBearingNotification, setShowBearingNotification] = useState(false)
  const [bearingNotificationDismissed, setBearingNotificationDismissed] = useState(false)

  // Inline edit state for header stats
  const [editingStat, setEditingStat] = useState<'calories' | 'weight' | 'heading' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newHabitName, setNewHabitName] = useState('')
  const [newTaskName, setNewTaskName] = useState('')
  const [completingTaskIds, setCompletingTaskIds] = useState<Set<string>>(new Set())
  const [showTaskDatePicker, setShowTaskDatePicker] = useState(false)
  const [selectedTaskDate, setSelectedTaskDate] = useState<string | null>(null)
  const [selectedTaskRecurrence, setSelectedTaskRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none')
  const [selectedTaskPriority, setSelectedTaskPriority] = useState<'low' | 'medium' | 'high' | null>(null)
  const [selectedTaskCategory, setSelectedTaskCategory] = useState<'work' | 'personal' | 'health' | 'finance' | 'errands' | 'learning' | null>(null)

  // View mode tabs
  const VIEW_TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'health', label: 'Health', icon: Heart },
    { id: 'todos', label: 'Todos', icon: CheckSquare },
    { id: 'goals', label: 'Goals', icon: Star },
    { id: 'reflect', label: 'Reflect', icon: BookOpen },
    { id: 'wealth', label: 'Wealth', icon: Wallet },
    { id: 'protocol', label: 'Protocol', icon: Zap },
  ] as const

  type ViewTab = typeof VIEW_TABS[number]['id']
  const [activeViewTab, setActiveViewTab] = useState<ViewTab>('overview')

  // Auth and onboarding state
  const [devBypass, setDevBypass] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true) // Default true to avoid flash
  const [showTutorial, setShowTutorial] = useState(false)

  // Tutorial steps definition
  const tutorialSteps: TutorialStep[] = [
    {
      target: '',
      title: 'Welcome to Knarr',
      description: 'Your personal command centre for life. Let me show you around the dashboard and how to track your progress.',
      position: 'center'
    },
    {
      target: '#tutorial-mode-toggle',
      title: 'View & Log Modes',
      description: 'Switch between View mode to see your progress and charts, or Log mode to enter your daily data like calories, weight, and habits.',
      position: 'bottom'
    },
    {
      target: '#tutorial-stats',
      title: 'Quick Stats',
      description: 'Your key metrics at a glance: current streak, today\'s calories, latest weight, habit completion, and 7-day weight average.',
      position: 'bottom'
    },
    {
      target: '#tutorial-charts',
      title: 'Progress Charts',
      description: 'Visualise your weight and calorie trends over time. The charts help you spot patterns and stay motivated towards your goals.',
      position: 'top'
    },
    {
      target: '#tutorial-habits',
      title: 'Habit Tracking',
      description: 'See your daily habit completion patterns. Building consistent habits is key to achieving your goals.',
      position: 'top'
    },
    {
      target: '',
      title: 'Ready to Begin',
      description: 'Switch to Log mode to start tracking your daily progress. Your voyage starts now!',
      position: 'center'
    }
  ]

  const today = getTodayString()

  // Set mounted on initial render
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check onboarding status AFTER data has loaded
  // This prevents showing onboarding while user settings are still loading from Supabase
  useEffect(() => {
    if (!dataLoaded) return // Wait for data to load first

    const onboardingDone = getOnboardingComplete()
    setHasCompletedOnboarding(onboardingDone)
    if (!onboardingDone) {
      setShowOnboarding(true)
    }
  }, [dataLoaded, getOnboardingComplete])

  // Check for delivered messages on load
  useEffect(() => {
    if (hasCheckedMessages || messages.length === 0) return

    // Find unread messages that have arrived
    const unreadArrived = messages.filter(m => !m.read && m.deliver_at <= today)

    if (unreadArrived.length > 0) {
      // Show the first unread message
      setCurrentDeliveredMessage(unreadArrived[0]!)
      setShowMessagePopup(true)
    }

    setHasCheckedMessages(true)
  }, [messages, today, hasCheckedMessages])

  // Today's data
  const todayCalories = calories.find(c => c.date === today)
  const todayWeight = weights.find(w => w.date === today)
  const todayHeading = headings.find(h => h.date === today)
  const todayHabitLogs = habitLogs.filter(l => l.date === today)
  const activeHabits = habits.filter(h => h.active)
  const completedHabits = todayHabitLogs.filter(l => l.completed).length

  // Selected date's data (for Log mode historical logging)
  const isLoggingToday = selectedLogDate === today
  const selectedDateCalories = calories.find(c => c.date === selectedLogDate)
  const selectedDateWeight = weights.find(w => w.date === selectedLogDate)
  const selectedDateHeading = headings.find(h => h.date === selectedLogDate)
  const selectedDateHabitLogs = habitLogs.filter(l => l.date === selectedLogDate)
  const selectedDateCompletedHabits = selectedDateHabitLogs.filter(l => l.completed).length

  // Today's tasks: scheduled for today OR no date specified (and not completed)
  const priorityOrder = { high: 0, medium: 1, low: 2, null: 3 }
  const todayTasks = tasks
    .filter(t => !t.completed && (t.scheduled_date === today || t.scheduled_date === null))
    .sort((a, b) => {
      const aPriority = priorityOrder[a.priority ?? 'null'] ?? 3
      const bPriority = priorityOrder[b.priority ?? 'null'] ?? 3
      return aPriority - bPriority
    })

  // Upcoming tasks: scheduled for future dates
  const upcomingTasks = tasks.filter(t =>
    !t.completed && t.scheduled_date && t.scheduled_date > today
  )

  // Completed tasks: sorted by completion date (most recent first)
  const completedTasks = tasks
    .filter(t => t.completed)
    .sort((a, b) => {
      const dateA = a.completed_at ? new Date(a.completed_at).getTime() : 0
      const dateB = b.completed_at ? new Date(b.completed_at).getTime() : 0
      return dateB - dateA
    })

  // Motivational quotes for when no data insight is available
  const motivationalQuotes = [
    { icon: '🧭', text: 'The journey of a thousand miles begins with a single step' },
    { icon: '⚓', text: 'Smooth seas never made a skilled sailor' },
    { icon: '🌊', text: 'Small daily improvements lead to remarkable results' },
    { icon: '💪', text: 'Progress, not perfection, is what matters' },
    { icon: '🔥', text: 'Every day is a new opportunity to grow stronger' },
    { icon: '🎯', text: 'Focus on the process, and results will follow' },
    { icon: '⭐', text: 'Consistency beats intensity every time' },
    { icon: '🌅', text: 'Today is another chance to be better than yesterday' },
    { icon: '🚀', text: 'Your only limit is the one you set for yourself' },
    { icon: '🏔️', text: 'Great things are built one habit at a time' },
  ]

  // Top insight calculation (single line)
  const topInsight = (() => {
    const sortedWeights = [...weights].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    const sortedCalories = [...calories].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    // Weight trend (lowered threshold)
    if (sortedWeights.length >= 7) {
      const recentDays = sortedWeights.slice(0, Math.min(7, sortedWeights.length))
      const olderDays = sortedWeights.slice(Math.min(7, sortedWeights.length))
      if (olderDays.length >= 3) {
        const avgRecent = recentDays.reduce((sum, w) => sum + w.weight, 0) / recentDays.length
        const avgOlder = olderDays.slice(0, Math.min(7, olderDays.length)).reduce((sum, w) => sum + w.weight, 0) / Math.min(7, olderDays.length)
        const diff = avgRecent - avgOlder
        if (Math.abs(diff) >= 0.3) {
          return { icon: diff < 0 ? '📉' : '📈', text: `Weight ${diff < 0 ? 'down' : 'up'} ${Math.abs(diff).toFixed(1)}kg from your average` }
        }
      }
    }

    // Calorie consistency (lowered threshold)
    if (sortedCalories.length >= 3 && calorieGoal) {
      const recent = sortedCalories.slice(0, Math.min(7, sortedCalories.length))
      const daysOnTarget = recent.filter(c => Math.abs(c.calories - calorieGoal) <= calorieGoal * 0.15).length
      if (daysOnTarget >= 3) return { icon: '🎯', text: `${daysOnTarget}/${recent.length} days within calorie target` }
    }

    // Habit consistency (lowered threshold)
    if (habitLogs.length >= 5 && activeHabits.length > 0) {
      const uniqueDates = [...new Set(habitLogs.map(l => l.date))].slice(-7)
      const highDays = uniqueDates.filter(date => {
        const dayLogs = habitLogs.filter(l => l.date === date && l.completed)
        return dayLogs.length >= activeHabits.length * 0.7
      })
      if (highDays.length >= 3) return { icon: '🔥', text: `Strong habits - ${highDays.length} great days this week` }
    }

    // Streak (lowered threshold)
    const uniqueCalorieDates = new Set(calories.map(c => c.date))
    let streak = 0
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date()
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      if (uniqueCalorieDates.has(dateStr!)) streak++
      else if (i > 0) break
    }
    if (streak >= 3) return { icon: '🏆', text: `${streak} day logging streak - keep it going!` }

    // Return random motivational quote if no data insight
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    return motivationalQuotes[dayOfYear % motivationalQuotes.length]
  })()

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

  // Streak calculations - using new grace day recovery system
  const uniqueCalorieDatesSet = new Set(calories.map(c => c.date))
  const streakResult = calculateStreakWithGrace(uniqueCalorieDatesSet)
  const calorieStreak = streakResult.count
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

  // Weekly bearing notification logic
  // Show notification if: it's Sunday OR we're past Monday in current week, AND no bearing exists
  const needsWeeklyBearing = !currentWeekBearing

  // Check for bearing notification on mount and when week changes
  useEffect(() => {
    if (!needsWeeklyBearing) {
      // Bearing already completed, hide notification
      setShowBearingNotification(false)
      return
    }

    // Check localStorage for dismissed state for current week
    const dismissedKey = `bearing_dismissed_${currentWeekBounds.start}`
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true'
    setBearingNotificationDismissed(wasDismissed)

    // Show popup if not dismissed
    if (!wasDismissed) {
      // Small delay to let the app load first
      const timer = setTimeout(() => {
        setShowBearingNotification(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [currentWeekBounds.start, needsWeeklyBearing])

  // Handlers - now use hook methods
  const handleLogCalories = (value: string, date: string) => {
    const numValue = parseInt(value)
    if (!isNaN(numValue)) {
      addCalorie(date, numValue)
    }
  }

  const handleLogWeight = (value: string, date: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      addWeight(date, numValue)
    }
  }

  const handleSetHeadingLocal = (value: string, date: string) => {
    if (value.trim()) {
      setHeading(date, value)
    }
  }

  const toggleHabit = (habitId: string) => {
    toggleHabitLog(habitId, today)
  }

  // Toggle habit for a specific date (used in Log mode with historical date)
  const toggleHabitForDate = (habitId: string, date: string) => {
    toggleHabitLog(habitId, date)
  }

  const handleSetWeightGoal = (goal: number) => {
    if (goal === 0) {
      setWeightGoal(null)
    } else {
      setWeightGoal(goal)
    }
  }

  const handleSetCalorieGoal = (goal: number) => {
    if (goal === 0) {
      setCalorieGoal(null)
    } else {
      setCalorieGoal(goal)
    }
  }

  // Settings handlers - now use hook methods
  const handleUpdateUserName = (name: string) => {
    setUserName(name)
  }

  const handleUpdateCalorieGoalFromSettings = (goal: number | null) => {
    setCalorieGoal(goal)
  }

  const handleUpdateWeightGoalFromSettings = (goal: number | null) => {
    setWeightGoal(goal)
  }

  const handleClearAllData = () => {
    clearAllData()
    setHasCompletedOnboarding(false)
    setShowOnboarding(true)
  }

  const handleResetOnboarding = () => {
    setOnboardingComplete(false)
    setTutorialComplete(false)
    setHasCompletedOnboarding(false)
    setShowOnboarding(true)
  }

  const loadSampleWeightData = async () => {
    const baseWeight = 85
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const variation = (Math.random() - 0.5) * 1.5 - (i * 0.08) // Slight downward trend
      const weight = Math.round((baseWeight + variation) * 10) / 10
      await addWeight(date.toISOString().split('T')[0]!, weight)
    }
    if (!weightGoal) {
      setWeightGoal(80)
    }
  }

  const loadSampleCalorieData = async () => {
    const baseCalories = 2000
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const variation = Math.floor((Math.random() - 0.5) * 600) // +/- 300 calories
      await addCalorie(date.toISOString().split('T')[0]!, baseCalories + variation)
    }
    if (!calorieGoal) {
      setCalorieGoal(2000)
    }
  }

  const loadSampleHabitData = async () => {
    // Create sample habits
    const habitNames = ['Morning workout', 'Read 30 minutes', 'Drink 8 glasses of water', 'Meditate']
    for (const name of habitNames) {
      await addHabit(name)
    }
    // Note: Habit logs would need to be created separately after habits are created
    // For simplicity, sample habits are created without historical logs
  }

  const handleAddMessage = (messageData: Omit<Message, 'id' | 'read'>) => {
    addMessage(messageData)
  }

  const handleMarkMessageRead = (id: string) => {
    markMessageRead(id)
  }

  const handleCloseMessagePopup = () => {
    // Find remaining unread arrived messages
    const remaining = messages.filter(m =>
      !m.read && m.deliver_at <= today && m.id !== currentDeliveredMessage?.id
    )

    if (remaining.length > 0) {
      // Show the next message
      setCurrentDeliveredMessage(remaining[0]!)
    } else {
      // No more messages, close popup
      setShowMessagePopup(false)
      setCurrentDeliveredMessage(null)
    }
  }

  const handleAddHabit = (name: string) => {
    addHabit(name)
  }

  const handleEditHabit = (id: string, name: string) => {
    updateHabit(id, { name })
  }

  const handleDeleteHabit = (id: string) => {
    deleteHabit(id)
  }

  const handleToggleHabitActive = (id: string) => {
    const habit = habits.find(h => h.id === id)
    if (habit) {
      updateHabit(id, { active: !habit.active })
    }
  }

  // Task handlers
  const handleAddTask = (name: string, scheduledDate?: string, recurrence: 'none' | 'daily' | 'weekly' | 'monthly' = 'none', priority: 'low' | 'medium' | 'high' | null = null, category: 'work' | 'personal' | 'health' | 'finance' | 'errands' | 'learning' | null = null) => {
    addTask(name, scheduledDate, recurrence, priority, category)
  }

  const handleCompleteTask = (id: string) => {
    // Add to completing set for animation
    setCompletingTaskIds(prev => new Set(prev).add(id))

    // Mark as completed via hook
    completeTask(id)

    // Clear animation state after animation completes
    setTimeout(() => {
      setCompletingTaskIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 1000)
  }

  const handleDeleteTask = (id: string) => {
    deleteTask(id)
  }

  const handleClearCompletedTasks = () => {
    // Delete each completed task
    const completed = tasks.filter(t => t.completed)
    completed.forEach(t => deleteTask(t.id))
  }

  const handleSaveBearing = (bearingData: Omit<Bearing, 'id' | 'created_at'>) => {
    // The hook handles upsert logic internally
    addBearing(bearingData)
  }

  const openBearingModal = (type: 'weekly' | 'monthly') => {
    setBearingType(type)
    setShowBearingModal(true)
  }

  // Bearing notification handlers
  const handleDismissBearingNotification = () => {
    const dismissedKey = `bearing_dismissed_${currentWeekBounds.start}`
    localStorage.setItem(dismissedKey, 'true')
    setBearingNotificationDismissed(true)
    setShowBearingNotification(false)
  }

  const handleFillOutBearing = () => {
    setShowBearingNotification(false)
    setBearingType('weekly')
    setShowBearingModal(true)
  }

  const handleAddLifeGoal = (goalData: Omit<LifeGoal, 'id' | 'created_at' | 'progress'>) => {
    if (editingGoal) {
      // Update existing goal
      updateLifeGoal(editingGoal.id, goalData)
    } else {
      // Create new goal
      addLifeGoal({ ...goalData, progress: 0 })
    }
    setEditingGoal(undefined)
  }

  const handleUpdateGoalProgress = (goalId: string, progress: number) => {
    updateLifeGoal(goalId, { progress })
  }

  const handleDeleteLifeGoal = (goalId: string) => {
    deleteLifeGoal(goalId)
  }

  const openEditGoal = (goal: LifeGoal) => {
    setEditingGoal(goal)
    setShowTrueNorthModal(true)
  }

  const handleAddWaypoint = (waypointData: Omit<Waypoint, 'id' | 'created_at'>) => {
    addWaypoint(waypointData)
  }

  const handleDeleteWaypoint = (waypointId: string) => {
    deleteWaypoint(waypointId)
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
    // Save user name (hook method handles storage)
    setUserName(data.name)

    // Save weight goal if provided
    if (data.weightGoal) {
      setWeightGoal(data.weightGoal)
    }

    // Save calorie goal if provided
    if (data.calorieGoal) {
      setCalorieGoal(data.calorieGoal)
    }

    // Add current weight as first entry if provided
    if (data.currentWeight) {
      addWeight(today, data.currentWeight)
    }

    // Create initial habits
    if (data.initialHabits.length > 0) {
      data.initialHabits.forEach(name => addHabit(name))
    }

    // Mark onboarding as complete and start tutorial
    setHasCompletedOnboarding(true)
    setShowOnboarding(false)
    setOnboardingComplete(true)

    // Start the tutorial after a brief delay to let the dashboard render
    setTimeout(() => {
      setShowTutorial(true)
    }, 500)
  }

  // Tutorial completion handlers
  const handleTutorialComplete = () => {
    setShowTutorial(false)
    setTutorialComplete(true)
  }

  const handleTutorialSkip = () => {
    setShowTutorial(false)
    setTutorialComplete(true)
  }

  // Sign out and reset all app state (for testing)
  const handleSignOutAndReset = async () => {
    // Use hook method to clear all data
    await clearAllData()

    // Reset state
    setHasCompletedOnboarding(false)
    setShowOnboarding(true)
    setShowTutorial(false)
    setDevBypass(false)

    // Sign out from Supabase if configured
    if (isConfigured) {
      await signOut()
    }

    // Reload to reset everything
    window.location.reload()
  }

  // Recent waypoints
  const recentWaypoints = [...waypoints]
    .sort((a, b) => new Date(b.achieved_date).getTime() - new Date(a.achieved_date).getTime())
    .slice(0, 10)

  // Loading state - wait for auth and data to load before showing anything
  if (!mounted || authLoading || dataLoading) {
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
      {/* Tutorial Overlay */}
      {showTutorial && (
        <Tutorial
          steps={tutorialSteps}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}

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
        <header className="page-header border-b border-white/5 safe-area-top">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <motion.div
                className="flex items-center gap-2 min-w-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img src="/iconmain.png" alt="Knarr" className="h-9 sm:h-11 w-auto flex-shrink-0" />
                <div className="leading-tight min-w-0">
                  <h1 className="font-display text-xl sm:text-2xl text-bone font-bold tracking-wide">Knarr</h1>
                  <p className="text-fog text-xs sm:text-sm -mt-0.5 truncate">{formatDate(new Date())}</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 sm:gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div id="tutorial-mode-toggle">
                  <ModeToggle mode={mode} onToggle={() => setMode(mode === 'view' ? 'log' : 'view')} />
                </div>
                {needsWeeklyBearing && (
                  <button
                    onClick={() => { setBearingType('weekly'); setShowBearingModal(true) }}
                    className="relative p-2 rounded-lg glass-recessed text-ember hover:bg-ember/10 transition-colors"
                    title="Weekly bearing due"
                  >
                    <CompassIcon className="w-4 h-4" />
                    <NotificationDot />
                  </button>
                )}
                <div id="tutorial-greeting" className="text-right hidden sm:block">
                  <p className="text-fog text-sm">{getGreeting()},</p>
                  <p className="font-display text-lg text-bone font-semibold truncate max-w-[120px]">
                    {user?.email?.split('@')[0] || userName}
                  </p>
                </div>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 rounded-lg text-fog hover:text-bone hover:bg-white/5 transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSignOutAndReset}
                  className="p-2 rounded-lg text-fog hover:text-bone hover:bg-white/5 transition-colors"
                  title="Sign out & reset"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Anchor Streak Bar - Visible in both modes when user has started logging */}
        {streakResult.count > 0 && (
          <AnchorStreakBar streakData={streakResult} />
        )}

        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 safe-area-bottom">
          <div className="glass-main p-4 sm:p-6">
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
              {/* Date Selector for Historical Logging */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const current = new Date(selectedLogDate + 'T00:00:00')
                        current.setDate(current.getDate() - 1)
                        setSelectedLogDate(current.toISOString().split('T')[0] ?? '')
                      }}
                      className="w-8 h-8 rounded-lg glass-recessed flex items-center justify-center text-fog hover:text-bone transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-ember" />
                      <input
                        type="date"
                        value={selectedLogDate}
                        max={today}
                        onChange={(e) => setSelectedLogDate(e.target.value || today)}
                        className="glass-recessed px-3 py-1.5 rounded-lg text-sm text-bone focus:outline-none focus:ring-1 focus:ring-ember/50"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (selectedLogDate < today) {
                          const current = new Date(selectedLogDate + 'T00:00:00')
                          current.setDate(current.getDate() + 1)
                          const newDate = current.toISOString().split('T')[0] ?? ''
                          if (newDate <= today) {
                            setSelectedLogDate(newDate)
                          }
                        }
                      }}
                      disabled={isLoggingToday}
                      className="w-8 h-8 rounded-lg glass-recessed flex items-center justify-center text-fog hover:text-bone transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  {!isLoggingToday && (
                    <button
                      onClick={() => setSelectedLogDate(today)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-ember/20 text-ember hover:bg-ember/30 transition-colors flex items-center gap-1.5"
                    >
                      Back to Today
                    </button>
                  )}
                </div>
                {!isLoggingToday && (
                  <p className="text-xs text-fjord mt-2 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Logging for {formatShortDate(selectedLogDate)}
                  </p>
                )}
              </div>

              {/* Today's Heading */}
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xs text-stone uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-ember" />
                  {isLoggingToday ? "Today's Heading" : `Heading for ${formatShortDate(selectedLogDate)}`}
                </h2>
                <input
                  type="text"
                  value={selectedDateHeading?.intention ?? ''}
                  onChange={(e) => handleSetHeadingLocal(e.target.value, selectedLogDate)}
                  placeholder={isLoggingToday ? "What's your focus for today?" : "What was your focus?"}
                  className="input w-full"
                />
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {/* Calories Input */}
                <div className="glass-recessed rounded-xl p-3 sm:p-4">
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-ember" />
                    Calories
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={selectedDateCalories?.calories ?? ''}
                    onChange={(e) => e.target.value && handleLogCalories(e.target.value, selectedLogDate)}
                    placeholder="0"
                    className="bg-transparent w-full font-mono text-xl sm:text-2xl text-bone focus:outline-none"
                    style={{ fontSize: '16px' }}
                  />
                  {calorieGoal && (
                    <p className="text-xs text-stone mt-1">Goal: {calorieGoal.toLocaleString()}</p>
                  )}
                </div>

                {/* Weight Input */}
                <div className="glass-recessed rounded-xl p-3 sm:p-4">
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5 text-fjord" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={selectedDateWeight?.weight ?? ''}
                    onChange={(e) => e.target.value && handleLogWeight(e.target.value, selectedLogDate)}
                    placeholder="0.0"
                    className="bg-transparent w-full font-mono text-xl sm:text-2xl text-bone focus:outline-none"
                    style={{ fontSize: '16px' }}
                  />
                  {weightGoal && (
                    <p className="text-xs text-stone mt-1">Goal: {weightGoal} kg</p>
                  )}
                </div>

                {/* Streak Display */}
                <div className="glass-recessed rounded-xl p-3 sm:p-4">
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-victory-green" />
                    Streak
                  </label>
                  <p className="font-mono text-xl sm:text-2xl text-victory-green">{Math.max(calorieStreak, habitStreak)}</p>
                  <p className="text-xs text-stone mt-1">days</p>
                </div>

                {/* Habits Progress */}
                <div className="glass-recessed rounded-xl p-3 sm:p-4">
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-victory-green" />
                    Habits
                  </label>
                  <p className="font-mono text-xl sm:text-2xl">
                    <span className="text-victory-green">{selectedDateCompletedHabits}</span>
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
                    {isLoggingToday ? "Today's Habits" : `Habits for ${formatShortDate(selectedLogDate)}`}
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
                      const isComplete = selectedDateHabitLogs.find(l => l.habit_id === habit.id)?.completed
                      return (
                        <button
                          key={habit.id}
                          onClick={() => toggleHabitForDate(habit.id, selectedLogDate)}
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

              {/* Tasks Checklist */}
              <div className="glass rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm text-bone font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4 text-ember" />
                    Today's Tasks
                  </h2>
                  <div className="flex items-center gap-2">
                    {upcomingTasks.length > 0 && (
                      <span className="text-xs text-ember bg-ember/10 px-2 py-0.5 rounded-full">
                        {upcomingTasks.length} upcoming
                      </span>
                    )}
                    <span className="text-xs text-stone">
                      {todayTasks.length} {todayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>
                </div>

                {todayTasks.length > 0 ? (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {todayTasks.map(task => {
                        const isCompleting = completingTaskIds.has(task.id)
                        return (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`task-item group ${isCompleting ? 'completing' : ''}`}
                          >
                            <button
                              onClick={() => handleCompleteTask(task.id)}
                              className="flex items-center gap-3 w-full text-left"
                              disabled={isCompleting}
                            >
                              <div className={`task-checkbox ${isCompleting ? 'checked' : ''}`}>
                                {isCompleting && (
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
                              <span className={`text-sm flex-1 ${isCompleting ? 'text-stone line-through' : 'text-bone'}`}>
                                {task.name}
                              </span>
                              {task.priority && (
                                <Flag className={`w-3 h-3 ${
                                  task.priority === 'high'
                                    ? 'text-blood-red'
                                    : task.priority === 'medium'
                                    ? 'text-warning-amber'
                                    : 'text-victory-green'
                                }`} />
                              )}
                              {task.recurrence && task.recurrence !== 'none' && (
                                <span className="text-xs text-fjord bg-fjord/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Repeat className="w-3 h-3" />
                                </span>
                              )}
                              {task.category && (
                                <span className="text-xs text-stone bg-iron-slate/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  {task.category === 'work' && <Briefcase className="w-3 h-3" />}
                                  {task.category === 'personal' && <Heart className="w-3 h-3" />}
                                  {task.category === 'health' && <Pill className="w-3 h-3" />}
                                  {task.category === 'finance' && <DollarSign className="w-3 h-3" />}
                                  {task.category === 'errands' && <ShoppingCart className="w-3 h-3" />}
                                  {task.category === 'learning' && <GraduationCap className="w-3 h-3" />}
                                </span>
                              )}
                            </button>
                            {!isCompleting && (
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 text-stone hover:text-blood-red transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className="text-stone text-sm text-center py-4">No tasks for today</p>
                )}

                {/* Add task inline */}
                <div className="mt-3 pt-3 border-t border-iron-slate/50">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add new task..."
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTaskName.trim()) {
                          handleAddTask(newTaskName.trim(), selectedTaskDate || undefined, selectedTaskRecurrence, selectedTaskPriority, selectedTaskCategory)
                          setNewTaskName('')
                          setSelectedTaskDate(null)
                          setSelectedTaskRecurrence('none')
                          setSelectedTaskPriority(null)
                          setSelectedTaskCategory(null)
                          setShowTaskDatePicker(false)
                        }
                      }}
                      className="glass-recessed px-3 py-2 rounded-lg text-sm text-bone placeholder-stone flex-1 focus:outline-none focus:ring-1 focus:ring-ember/50"
                    />
                    <button
                      onClick={() => setShowTaskDatePicker(!showTaskDatePicker)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedTaskDate
                          ? 'bg-ember/20 text-ember'
                          : 'bg-iron-slate/30 text-stone hover:text-bone hover:bg-iron-slate/50'
                      }`}
                      title="Schedule for a date"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const options: ('none' | 'daily' | 'weekly' | 'monthly')[] = ['none', 'daily', 'weekly', 'monthly']
                        const currentIndex = options.indexOf(selectedTaskRecurrence)
                        setSelectedTaskRecurrence(options[(currentIndex + 1) % options.length]!)
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedTaskRecurrence !== 'none'
                          ? 'bg-fjord/20 text-fjord'
                          : 'bg-iron-slate/30 text-stone hover:text-bone hover:bg-iron-slate/50'
                      }`}
                      title={`Repeat: ${selectedTaskRecurrence}`}
                    >
                      <Repeat className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const options: (typeof selectedTaskPriority)[] = [null, 'low', 'medium', 'high']
                        const currentIndex = options.indexOf(selectedTaskPriority)
                        setSelectedTaskPriority(options[(currentIndex + 1) % options.length]!)
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedTaskPriority === 'high'
                          ? 'bg-blood-red/20 text-blood-red'
                          : selectedTaskPriority === 'medium'
                          ? 'bg-warning-amber/20 text-warning-amber'
                          : selectedTaskPriority === 'low'
                          ? 'bg-victory-green/20 text-victory-green'
                          : 'bg-iron-slate/30 text-stone hover:text-bone hover:bg-iron-slate/50'
                      }`}
                      title={`Priority: ${selectedTaskPriority || 'none'}`}
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const options: (typeof selectedTaskCategory)[] = [null, 'work', 'personal', 'health', 'finance', 'errands', 'learning']
                        const currentIndex = options.indexOf(selectedTaskCategory)
                        setSelectedTaskCategory(options[(currentIndex + 1) % options.length]!)
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedTaskCategory
                          ? 'bg-fjord/20 text-fjord'
                          : 'bg-iron-slate/30 text-stone hover:text-bone hover:bg-iron-slate/50'
                      }`}
                      title={`Category: ${selectedTaskCategory || 'none'}`}
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                    {newTaskName.trim() && (
                      <button
                        onClick={() => {
                          handleAddTask(newTaskName.trim(), selectedTaskDate || undefined, selectedTaskRecurrence, selectedTaskPriority, selectedTaskCategory)
                          setNewTaskName('')
                          setSelectedTaskDate(null)
                          setSelectedTaskRecurrence('none')
                          setSelectedTaskPriority(null)
                          setSelectedTaskCategory(null)
                          setShowTaskDatePicker(false)
                        }}
                        className="p-2 rounded-lg bg-ember/20 text-ember hover:bg-ember/30 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Selected date, recurrence, priority, and category badges */}
                  {(selectedTaskDate || selectedTaskRecurrence !== 'none' || selectedTaskPriority || selectedTaskCategory) && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {selectedTaskDate && (
                        <span className="text-xs text-ember bg-ember/10 px-2 py-1 rounded-full flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {selectedTaskDate === today
                            ? 'Today'
                            : selectedTaskDate === getDateOffset(1)
                            ? 'Tomorrow'
                            : formatShortDate(selectedTaskDate)}
                          <button
                            onClick={() => setSelectedTaskDate(null)}
                            className="ml-1 hover:text-bone"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {selectedTaskRecurrence !== 'none' && (
                        <span className="text-xs text-fjord bg-fjord/10 px-2 py-1 rounded-full flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          {selectedTaskRecurrence.charAt(0).toUpperCase() + selectedTaskRecurrence.slice(1)}
                          <button
                            onClick={() => setSelectedTaskRecurrence('none')}
                            className="ml-1 hover:text-bone"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {selectedTaskPriority && (
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                          selectedTaskPriority === 'high'
                            ? 'text-blood-red bg-blood-red/10'
                            : selectedTaskPriority === 'medium'
                            ? 'text-warning-amber bg-warning-amber/10'
                            : 'text-victory-green bg-victory-green/10'
                        }`}>
                          <Flag className="w-3 h-3" />
                          {selectedTaskPriority.charAt(0).toUpperCase() + selectedTaskPriority.slice(1)}
                          <button
                            onClick={() => setSelectedTaskPriority(null)}
                            className="ml-1 hover:text-bone"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {selectedTaskCategory && (
                        <span className="text-xs text-fjord bg-fjord/10 px-2 py-1 rounded-full flex items-center gap-1">
                          {selectedTaskCategory === 'work' && <Briefcase className="w-3 h-3" />}
                          {selectedTaskCategory === 'personal' && <Heart className="w-3 h-3" />}
                          {selectedTaskCategory === 'health' && <Pill className="w-3 h-3" />}
                          {selectedTaskCategory === 'finance' && <DollarSign className="w-3 h-3" />}
                          {selectedTaskCategory === 'errands' && <ShoppingCart className="w-3 h-3" />}
                          {selectedTaskCategory === 'learning' && <GraduationCap className="w-3 h-3" />}
                          {selectedTaskCategory.charAt(0).toUpperCase() + selectedTaskCategory.slice(1)}
                          <button
                            onClick={() => setSelectedTaskCategory(null)}
                            className="ml-1 hover:text-bone"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Date picker dropdown */}
                  <AnimatePresence>
                    {showTaskDatePicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 glass-recessed rounded-lg p-3"
                      >
                        <div className="flex flex-wrap gap-2 mb-3">
                          <button
                            onClick={() => {
                              setSelectedTaskDate(null)
                              setShowTaskDatePicker(false)
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                              selectedTaskDate === null
                                ? 'bg-ember text-forge-black'
                                : 'bg-iron-slate/50 text-fog hover:bg-iron-slate'
                            }`}
                          >
                            Today
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTaskDate(getDateOffset(1))
                              setShowTaskDatePicker(false)
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                              selectedTaskDate === getDateOffset(1)
                                ? 'bg-ember text-forge-black'
                                : 'bg-iron-slate/50 text-fog hover:bg-iron-slate'
                            }`}
                          >
                            Tomorrow
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTaskDate(getDateOffset(7))
                              setShowTaskDatePicker(false)
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                              selectedTaskDate === getDateOffset(7)
                                ? 'bg-ember text-forge-black'
                                : 'bg-iron-slate/50 text-fog hover:bg-iron-slate'
                            }`}
                          >
                            Next Week
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            min={today}
                            value={selectedTaskDate || ''}
                            onChange={(e) => {
                              setSelectedTaskDate(e.target.value || null)
                              setShowTaskDatePicker(false)
                            }}
                            className="glass-recessed px-3 py-1.5 rounded-lg text-xs text-bone flex-1 focus:outline-none focus:ring-1 focus:ring-ember/50"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Finance Section */}
              <div className="glass rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm text-bone font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-victory-green" />
                    Net Worth Tracker
                  </h2>
                  {hasFinanceKey() && (
                    <button
                      onClick={() => setShowAddAccountModal(true)}
                      className="text-xs text-victory-green hover:text-victory-green/80 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Account
                    </button>
                  )}
                </div>

                {!hasFinanceKey() ? (
                  <div className="text-center py-6">
                    <DollarSign className="w-10 h-10 text-victory-green/30 mx-auto mb-3" />
                    <p className="text-sm text-fog mb-3">
                      Track your finances with client-side encryption
                    </p>
                    <p className="text-xs text-stone mb-4">
                      Your data is encrypted before it leaves your device
                    </p>
                    <button
                      onClick={() => setShowFinanceSetupModal(true)}
                      className="btn-primary px-6"
                    >
                      Setup Finance Tracking
                    </button>
                  </div>
                ) : financeAccounts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-stone text-sm mb-3">No accounts yet</p>
                    <button
                      onClick={() => setShowAddAccountModal(true)}
                      className="w-full py-3 rounded-lg border border-dashed border-iron-slate text-stone hover:text-bone hover:border-victory-green/50 transition-all text-sm"
                    >
                      Add your first account...
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Net Worth Summary */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="glass-recessed rounded-lg p-3 text-center">
                        <p className="text-xs text-stone uppercase mb-1">Assets</p>
                        <p className="text-lg font-mono text-victory-green">
                          ${financeAccounts.filter(a => a.is_asset).reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="glass-recessed rounded-lg p-3 text-center">
                        <p className="text-xs text-stone uppercase mb-1">Liabilities</p>
                        <p className="text-lg font-mono text-blood-red">
                          ${financeAccounts.filter(a => !a.is_asset).reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="glass-recessed rounded-lg p-3 text-center">
                        <p className="text-xs text-stone uppercase mb-1">Net Worth</p>
                        <p className={`text-lg font-mono ${
                          financeAccounts.filter(a => a.is_asset).reduce((sum, a) => sum + a.balance, 0) -
                          financeAccounts.filter(a => !a.is_asset).reduce((sum, a) => sum + a.balance, 0) >= 0
                            ? 'text-victory-green' : 'text-blood-red'
                        }`}>
                          ${(
                            financeAccounts.filter(a => a.is_asset).reduce((sum, a) => sum + a.balance, 0) -
                            financeAccounts.filter(a => !a.is_asset).reduce((sum, a) => sum + a.balance, 0)
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Account List */}
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {financeAccounts.map(account => (
                        <button
                          key={account.id}
                          onClick={() => {
                            setEditingAccount(account)
                            setShowAddAccountModal(true)
                          }}
                          className="w-full flex items-center justify-between py-2 px-3 glass-recessed rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full ${account.is_asset ? 'bg-victory-green' : 'bg-blood-red'}`} />
                            <span className="text-sm text-bone truncate">{account.name}</span>
                            <span className="text-xs text-stone">{account.type}</span>
                          </div>
                          <span className={`text-sm font-mono ${account.is_asset ? 'text-victory-green' : 'text-blood-red'}`}>
                            {account.is_asset ? '+' : '-'}${Math.abs(account.balance).toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Snapshot Button */}
                    <button
                      onClick={async () => {
                        await takeNetWorthSnapshot()
                      }}
                      className="w-full mt-3 py-2 rounded-lg text-xs text-stone hover:text-bone border border-iron-slate/50 hover:border-victory-green/30 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Take Net Worth Snapshot
                    </button>
                  </>
                )}
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

              {/* Life Goals & Waypoints Row */}
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {/* True North / Life Goals */}
                <div className="glass rounded-xl p-4">
                  <h2 className="text-sm text-bone font-semibold flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-ember" />
                    True North
                  </h2>
                  <button
                    onClick={() => {
                      setEditingGoal(undefined)
                      setShowTrueNorthModal(true)
                    }}
                    className="w-full py-3 rounded-lg border border-dashed border-iron-slate text-stone hover:text-bone hover:border-ember/50 transition-all text-sm"
                  >
                    Set a new life goal...
                  </button>
                  {lifeGoals.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-iron-slate/50">
                      <p className="text-xs text-stone mb-2">Edit existing goals:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {lifeGoals.slice(0, 3).map(goal => (
                          <button
                            key={goal.id}
                            onClick={() => {
                              setEditingGoal(goal)
                              setShowTrueNorthModal(true)
                            }}
                            className="px-2 py-1 text-xs bg-iron-slate/30 text-fog hover:text-bone hover:bg-iron-slate/50 rounded-lg transition-colors truncate max-w-[120px]"
                          >
                            {goal.title}
                          </button>
                        ))}
                        {lifeGoals.length > 3 && (
                          <span className="px-2 py-1 text-xs text-stone">+{lifeGoals.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Log Waypoint */}
                <div className="glass rounded-xl p-4">
                  <h2 className="text-sm text-bone font-semibold flex items-center gap-2 mb-3">
                    <Flag className="w-4 h-4 text-victory-green" />
                    Log Waypoint
                  </h2>
                  <button
                    onClick={() => setShowWaypointModal(true)}
                    className="w-full py-3 rounded-lg border border-dashed border-iron-slate text-stone hover:text-bone hover:border-victory-green/50 transition-all text-sm"
                  >
                    Record a milestone or achievement...
                  </button>
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


          {/* Stats at a Glance */}
          <div id="tutorial-stats" className="mb-4 sm:mb-6">
            <h2 className="text-xs text-stone uppercase tracking-wider mb-3 flex items-center gap-2">
              <CompassIcon className="w-3.5 h-3.5 text-ember" />
              Stats at a Glance
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {/* Streak Card */}
              <div className="glass-recessed rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-stone uppercase">Streak</span>
                  <Target className="w-3.5 h-3.5 text-ember" />
                </div>
                <p className="font-mono text-2xl sm:text-3xl text-ember font-semibold">{Math.max(calorieStreak, habitStreak)}</p>
                <p className="text-xs text-stone">consecutive days</p>
              </div>

              {/* Calories Card with mini progress */}
              <div className="glass-recessed rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-stone uppercase">Calories</span>
                  <Flame className="w-3.5 h-3.5 text-ember" />
                </div>
                <p className="font-mono text-2xl sm:text-3xl text-bone font-semibold">{todayCalories?.calories?.toLocaleString() ?? '--'}</p>
                {calorieGoal && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-iron-slate/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ember rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((todayCalories?.calories ?? 0) / calorieGoal) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-stone mt-1">of {calorieGoal.toLocaleString()} goal</p>
                  </div>
                )}
              </div>

              {/* Weight Card with trend */}
              <div className="glass-recessed rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-stone uppercase">Weight</span>
                  <Scale className="w-3.5 h-3.5 text-fjord" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="font-mono text-2xl sm:text-3xl text-bone font-semibold">{latestWeight?.weight ?? '--'}</p>
                  <span className="text-sm text-stone">kg</span>
                  {weightTrend && (
                    <span className={`text-sm ${weightTrend === 'down' ? 'text-victory-green' : weightTrend === 'up' ? 'text-ember' : 'text-stone'}`}>
                      {weightTrend === 'down' ? '↓' : weightTrend === 'up' ? '↑' : '→'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone mt-1">7d avg: {rollingAverage ?? '--'} kg</p>
              </div>

              {/* Habits Card with progress ring */}
              <div className="glass-recessed rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-stone uppercase">Habits</span>
                  <CheckSquare className="w-3.5 h-3.5 text-victory-green" />
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-2xl sm:text-3xl font-semibold">
                    <span className="text-victory-green">{completedHabits}</span>
                    <span className="text-stone text-lg">/{activeHabits.length}</span>
                  </p>
                  {activeHabits.length > 0 && (
                    <div className="flex-1">
                      <div className="h-1.5 bg-iron-slate/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-victory-green rounded-full transition-all duration-500"
                          style={{ width: `${(completedHabits / activeHabits.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-stone mt-1">completed today</p>
              </div>
            </div>
          </div>

          {/* Single Line Insight */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-base">{topInsight?.icon || '💡'}</span>
            <span className="text-sm text-fog">{topInsight?.text || 'Keep logging to unlock insights about your patterns'}</span>
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-1 mb-4 p-1 glass-recessed rounded-xl overflow-x-auto">
            {VIEW_TABS.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeViewTab === tab.id
              const showNotificationDot = tab.id === 'reflect' && needsWeeklyBearing
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveViewTab(tab.id as ViewTab)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-ember text-forge-black'
                      : 'text-stone hover:text-bone hover:bg-white/5'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {tab.label}
                  {showNotificationDot && !isActive && <NotificationDot className="top-1 right-1" />}
                </button>
              )
            })}
          </div>

          {/* Weight Chart - Full Width */}
          {(activeViewTab === 'overview' || activeViewTab === 'health') && (
            <div id="tutorial-charts" className="glass p-3 sm:p-4 mb-3 sm:mb-4 h-[240px] sm:h-[280px]">
              <WeightChart weights={weights} goal={weightGoal} onLoadSample={loadSampleWeightData} onLogWeight={() => { setMode('log') }} />
            </div>
          )}

          {/* Calorie Chart - Full Width */}
          {(activeViewTab === 'overview' || activeViewTab === 'health') && (
            <div className="glass p-3 sm:p-4 mb-3 sm:mb-4 h-[240px] sm:h-[280px]">
              <CalorieChart calories={calories} goal={calorieGoal} onLoadSample={loadSampleCalorieData} />
            </div>
          )}

          {/* Habit Chart - Full Width */}
          {(activeViewTab === 'overview' || activeViewTab === 'todos') && (
            <div id="tutorial-habits" className="glass p-3 sm:p-4 mb-3 sm:mb-4 h-[240px] sm:h-[280px]">
              <HabitChart habitLogs={habitLogs} habits={habits} onLoadSample={loadSampleHabitData} />
            </div>
          )}

          {/* Task Chart - Full Width */}
          {(activeViewTab === 'overview' || activeViewTab === 'todos') && (
            <div className="glass p-3 sm:p-4 mb-3 sm:mb-4 h-[240px] sm:h-[280px]">
              <TaskChart tasks={tasks} />
            </div>
          )}

          {/* Task Manager Section */}
          {(activeViewTab === 'overview' || activeViewTab === 'todos') && (
            <div className="glass p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm text-bone flex items-center gap-2">
                  <Target className="w-4 h-4 text-ember" />
                  Task Manager
                </h3>
              {completedTasks.length > 0 && (
                <button
                  onClick={handleClearCompletedTasks}
                  className="text-xs text-stone hover:text-blood-red transition-colors"
                >
                  Clear completed
                </button>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="glass-recessed rounded-lg p-3 text-center">
                <p className="text-2xl font-mono text-bone">{todayTasks.length}</p>
                <p className="text-xs text-stone">Today</p>
              </div>
              <div className="glass-recessed rounded-lg p-3 text-center">
                <p className="text-2xl font-mono text-ember">{upcomingTasks.length}</p>
                <p className="text-xs text-stone">Upcoming</p>
              </div>
              <div className="glass-recessed rounded-lg p-3 text-center">
                <p className="text-2xl font-mono text-victory-green">{completedTasks.length}</p>
                <p className="text-xs text-stone">Completed</p>
              </div>
            </div>

            {/* Upcoming Tasks */}
            {upcomingTasks.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs text-stone uppercase tracking-wider mb-2">Upcoming</h4>
                <div className="space-y-1">
                  {upcomingTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between py-2 px-3 glass-recessed rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-fog">{task.name}</span>
                        {task.recurrence && task.recurrence !== 'none' && (
                          <Repeat className="w-3 h-3 text-fjord" />
                        )}
                        {task.category && (
                          <span className="text-xs text-stone">
                            {task.category === 'work' && <Briefcase className="w-3 h-3" />}
                            {task.category === 'personal' && <Heart className="w-3 h-3" />}
                            {task.category === 'health' && <Pill className="w-3 h-3" />}
                            {task.category === 'finance' && <DollarSign className="w-3 h-3" />}
                            {task.category === 'errands' && <ShoppingCart className="w-3 h-3" />}
                            {task.category === 'learning' && <GraduationCap className="w-3 h-3" />}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-ember">
                        {task.scheduled_date === getDateOffset(1)
                          ? 'Tomorrow'
                          : formatShortDate(task.scheduled_date!)}
                      </span>
                    </div>
                  ))}
                  {upcomingTasks.length > 5 && (
                    <p className="text-xs text-stone text-center py-1">
                      +{upcomingTasks.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 ? (
              <div>
                <h4 className="text-xs text-stone uppercase tracking-wider mb-2">Completed</h4>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {completedTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between py-2 px-3 glass-recessed rounded-lg group">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <CheckSquare className="w-4 h-4 text-victory-green flex-shrink-0" />
                        <span className="text-sm text-stone line-through truncate">{task.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone">
                          {task.completed_at
                            ? formatShortDate(task.completed_at.split('T')[0])
                            : ''}
                        </span>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-stone hover:text-blood-red transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-stone text-sm text-center py-4">
                No completed tasks yet. Complete tasks in Log mode!
              </p>
            )}
            </div>
          )}

          {/* Bearings (Reflections) Section */}
          {activeViewTab === 'reflect' && (
            <div className="glass p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm text-bone flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-fjord" />
                  Bearings
                </h3>
                <span className="text-xs text-stone">Log reflections in Log mode</span>
              </div>

              {/* Current Period Status */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="glass-recessed rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-stone">This Week</span>
                    {currentWeekBearing ? (
                      <span className="text-xs text-victory-green">Logged</span>
                    ) : (
                      <span className="text-xs text-ember">Not logged</span>
                    )}
                  </div>
                  <p className="text-xs text-fog">
                    {formatPeriod(currentWeekBounds.start, currentWeekBounds.end, 'weekly')}
                  </p>
                </div>
                <div className="glass-recessed rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-stone">This Month</span>
                    {currentMonthBearing ? (
                      <span className="text-xs text-victory-green">Logged</span>
                    ) : (
                      <span className="text-xs text-ember">Not logged</span>
                    )}
                  </div>
                  <p className="text-xs text-fog">
                    {formatPeriod(currentMonthBounds.start, currentMonthBounds.end, 'monthly')}
                  </p>
                </div>
              </div>

              {/* Recent Bearings */}
              {recentBearings.length > 0 ? (
                <div>
                  <h4 className="text-xs text-stone uppercase tracking-wider mb-3">Recent Reflections</h4>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {recentBearings.map(bearing => (
                      <motion.div
                        key={bearing.id}
                        className="glass-recessed p-4 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            bearing.type === 'weekly' ? 'bg-fjord/30 text-fjord' : 'bg-ember/30 text-ember'
                          }`}>
                            {bearing.type === 'weekly' ? 'Weekly' : 'Monthly'}
                          </span>
                          <span className="text-caption text-stone">
                            {formatPeriod(bearing.period_start, bearing.period_end, bearing.type)}
                          </span>
                        </div>

                        {/* Wins */}
                        {bearing.wins.filter(w => w.trim()).length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-victory-green mb-1 flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              Wins
                            </p>
                            <ul className="text-fog text-sm space-y-0.5">
                              {bearing.wins.filter(w => w.trim()).map((win, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-victory-green">+</span>
                                  {win}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Challenges */}
                        {bearing.challenges.filter(c => c.trim()).length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-ember mb-1 flex items-center gap-1">
                              <Flag className="w-3 h-3" />
                              Challenges
                            </p>
                            <ul className="text-fog text-sm space-y-0.5">
                              {bearing.challenges.filter(c => c.trim()).map((challenge, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-ember">-</span>
                                  {challenge}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Lessons */}
                        {bearing.lessons && (
                          <div className="mb-3">
                            <p className="text-xs text-fjord mb-1 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              Lessons Learned
                            </p>
                            <p className="text-fog text-sm">{bearing.lessons}</p>
                          </div>
                        )}

                        {/* Focus */}
                        {bearing.focus && (
                          <div className="glass-recessed p-2 rounded text-sm">
                            <span className="text-caption text-stone">Next Focus: </span>
                            <span className="text-fog">{bearing.focus}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Anchor className="w-8 h-8 text-stone mx-auto mb-2" />
                  <p className="text-stone text-sm">No bearings logged yet.</p>
                  <p className="text-stone text-xs mt-1">
                    Reflect on your week or month to track your journey.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Finance Section */}
          {activeViewTab === 'wealth' && (
            <div className="glass p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm text-bone flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-victory-green" />
                  Net Worth
                </h3>
                <span className="text-xs text-stone">Manage in Log mode</span>
              </div>

              {!hasFinanceKey() ? (
                <div className="text-center py-6">
                  <DollarSign className="w-8 h-8 text-stone/50 mx-auto mb-2" />
                  <p className="text-stone text-sm">Finance tracking not set up.</p>
                  <p className="text-stone/70 text-xs mt-1">Set up encrypted finance tracking in Log mode.</p>
                </div>
              ) : financeAccounts.length === 0 ? (
                <div className="text-center py-6">
                  <DollarSign className="w-8 h-8 text-stone/50 mx-auto mb-2" />
                  <p className="text-stone text-sm">No accounts added yet.</p>
                  <p className="text-stone/70 text-xs mt-1">Add accounts in Log mode to track your net worth.</p>
                </div>
              ) : (
                <>
                  {/* Net Worth Summary */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="glass-recessed rounded-lg p-3 text-center">
                      <p className="text-xs text-stone uppercase mb-1">Assets</p>
                      <p className="text-xl font-mono text-victory-green">
                        ${financeAccounts.filter(a => a.is_asset).reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="glass-recessed rounded-lg p-3 text-center">
                      <p className="text-xs text-stone uppercase mb-1">Liabilities</p>
                      <p className="text-xl font-mono text-blood-red">
                        ${financeAccounts.filter(a => !a.is_asset).reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="glass-recessed rounded-lg p-3 text-center">
                      <p className="text-xs text-stone uppercase mb-1">Net Worth</p>
                      <p className={`text-xl font-mono ${
                        financeAccounts.filter(a => a.is_asset).reduce((sum, a) => sum + a.balance, 0) -
                        financeAccounts.filter(a => !a.is_asset).reduce((sum, a) => sum + a.balance, 0) >= 0
                          ? 'text-victory-green' : 'text-blood-red'
                      }`}>
                        ${(
                          financeAccounts.filter(a => a.is_asset).reduce((sum, a) => sum + a.balance, 0) -
                          financeAccounts.filter(a => !a.is_asset).reduce((sum, a) => sum + a.balance, 0)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Net Worth History Chart */}
                  {netWorthSnapshots.length > 1 && (
                    <div className="h-[200px] mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={netWorthSnapshots.slice().reverse().map(s => ({
                          date: s.date,
                          netWorth: s.net_worth,
                          assets: s.total_assets,
                          liabilities: s.total_liabilities,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis
                            dataKey="date"
                            stroke="#6B7280"
                            fontSize={10}
                            tickFormatter={(value) => new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis
                            stroke="#6B7280"
                            fontSize={10}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(30, 30, 30, 0.95)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                            }}
                            labelFormatter={(label) => new Date(label + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                            formatter={(value, name) => [`$${(value as number)?.toLocaleString() ?? '0'}`, name === 'netWorth' ? 'Net Worth' : name === 'assets' ? 'Assets' : 'Liabilities']}
                          />
                          <Area
                            type="monotone"
                            dataKey="assets"
                            fill="rgba(34, 197, 94, 0.2)"
                            stroke="rgba(34, 197, 94, 0.5)"
                            strokeWidth={1}
                          />
                          <Line
                            type="monotone"
                            dataKey="netWorth"
                            stroke="#22C55E"
                            strokeWidth={2}
                            dot={{ fill: '#22C55E', r: 3 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Account Breakdown by Type */}
                  <div className="space-y-3">
                    <h4 className="text-xs text-stone uppercase tracking-wider">Account Breakdown</h4>
                    {/* Assets */}
                    <div className="space-y-2">
                      {financeAccounts.filter(a => a.is_asset).map(account => (
                        <div key={account.id} className="flex items-center justify-between py-1.5 px-2 glass-recessed rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-victory-green" />
                            <span className="text-sm text-fog">{account.name}</span>
                            <span className="text-xs text-stone">{account.type}</span>
                          </div>
                          <span className="text-sm font-mono text-victory-green">
                            +${account.balance.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Liabilities */}
                    {financeAccounts.filter(a => !a.is_asset).length > 0 && (
                      <div className="space-y-2">
                        {financeAccounts.filter(a => !a.is_asset).map(account => (
                          <div key={account.id} className="flex items-center justify-between py-1.5 px-2 glass-recessed rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blood-red" />
                              <span className="text-sm text-fog">{account.name}</span>
                              <span className="text-xs text-stone">{account.type}</span>
                            </div>
                            <span className="text-sm font-mono text-blood-red">
                              -${Math.abs(account.balance).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Last snapshot info */}
                  {netWorthSnapshots.length > 0 && (
                    <p className="text-xs text-stone mt-3 text-center">
                      Last snapshot: {formatShortDate(netWorthSnapshots[0].date)}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Dopamine Routine Section */}
          {activeViewTab === 'protocol' && (
            <div className="glass p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm text-bone flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Dopamine Routine
                </h3>
                <span className="text-xs text-stone">Fight-or-Flight Protocol</span>
              </div>

              {/* Phase Filter Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setActiveRoutinePhase('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeRoutinePhase === 'all'
                      ? 'bg-ember/20 text-ember border border-ember/30'
                      : 'glass-recessed text-fog hover:text-bone'
                  }`}
                >
                  All Phases
                </button>
                {DOPAMINE_ROUTINE.map((phase) => {
                  const IconComponent = phase.icon
                  return (
                    <button
                      key={phase.id}
                      onClick={() => setActiveRoutinePhase(phase.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                        activeRoutinePhase === phase.id
                          ? `${phase.bgColor} ${phase.color} border border-current/30`
                          : 'glass-recessed text-fog hover:text-bone'
                      }`}
                    >
                      <IconComponent className="w-3 h-3" />
                      {phase.title.split(' ')[0]}
                    </button>
                  )
                })}
              </div>

              {/* Phase Cards */}
              <div className="space-y-3">
                {DOPAMINE_ROUTINE.filter(
                  (phase) => activeRoutinePhase === 'all' || activeRoutinePhase === phase.id
                ).map((phase) => {
                  const IconComponent = phase.icon
                  const isExpanded = expandedPhases.has(phase.id)
                  return (
                    <motion.div
                      key={phase.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl border ${phase.color.replace('text-', 'border-')}/20 overflow-hidden`}
                    >
                      {/* Phase Header - Clickable */}
                      <button
                        onClick={() => togglePhaseExpanded(phase.id)}
                        className={`${phase.bgColor} px-4 py-3 w-full text-left hover:brightness-110 transition-all`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-forge-black/30 flex items-center justify-center`}>
                              <IconComponent className={`w-4 h-4 ${phase.color}`} />
                            </div>
                            <div>
                              <h3 className={`font-semibold ${phase.color}`}>{phase.title}</h3>
                              <p className="text-xs text-fog">{phase.subtitle} • {phase.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-xs text-fog hidden sm:block">{phase.goal}</p>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className={`w-5 h-5 ${phase.color}`} />
                            </motion.div>
                          </div>
                        </div>
                      </button>

                      {/* Phase Content - Collapsible */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-forge-black/30">
                              {/* Environment Setup */}
                              {phase.environment && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                  {phase.environment.map((env, i) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-iron-slate/50 text-fog">
                                      {env}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Trigger (for Rescue) */}
                              {phase.trigger && (
                                <div className="mb-3 p-2 rounded-lg bg-blood-red/10 border border-blood-red/20">
                                  <p className="text-xs text-blood-red">
                                    <span className="font-medium">Trigger:</span> {phase.trigger}
                                  </p>
                                  {phase.limit && (
                                    <p className="text-xs text-blood-red/70 mt-1">{phase.limit}</p>
                                  )}
                                </div>
                              )}

                              {/* Supplement Items */}
                              <div className="space-y-2">
                                {phase.items.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => {
                                      setSelectedSupplement(item)
                                      setSelectedSupplementPhase(phase)
                                      setShowSupplementModal(true)
                                    }}
                                    className="w-full flex items-center justify-between p-3 rounded-lg glass-recessed hover:bg-white/5 transition-colors group"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className={`w-6 h-6 rounded-md ${phase.bgColor} flex items-center justify-center shrink-0`}>
                                        <Pill className={`w-3 h-3 ${phase.color}`} />
                                      </div>
                                      <div className="text-left min-w-0">
                                        <p className="text-sm text-bone truncate flex items-center gap-2">
                                          {item.name}
                                          {item.optional && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-iron-slate/50 text-stone">
                                              Optional
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-xs text-fog truncate">{item.effect}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-xs font-mono text-stone">{item.dosage}</span>
                                      <Info className="w-4 h-4 text-stone group-hover:text-bone transition-colors" />
                                    </div>
                                  </button>
                                ))}
                              </div>

                              {/* Protocol Rule */}
                              {phase.protocolRule && (
                                <div className="mt-3 p-2 rounded-lg bg-ember/10 border border-ember/20 flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-ember shrink-0 mt-0.5" />
                                  <p className="text-xs text-ember">{phase.protocolRule}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>

              {/* Quick Reference */}
              <div className="mt-4 pt-4 border-t border-iron-slate/50">
                <p className="text-xs text-stone mb-2 flex items-center gap-2">
                  <Beaker className="w-3 h-3" />
                  Powder Measurements (No Scoops)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="glass-recessed px-2 py-1.5 rounded">
                    <span className="text-fog">Creatine:</span> <span className="text-bone">1 tsp (~5g)</span>
                  </div>
                  <div className="glass-recessed px-2 py-1.5 rounded">
                    <span className="text-fog">Glycine:</span> <span className="text-bone">1 heap tsp</span>
                  </div>
                  <div className="glass-recessed px-2 py-1.5 rounded">
                    <span className="text-fog">Taurine:</span> <span className="text-bone">1/4 tsp (~1g)</span>
                  </div>
                  <div className="glass-recessed px-2 py-1.5 rounded">
                    <span className="text-fog">Magnesium:</span> <span className="text-bone">1/2 tsp</span>
                  </div>
                  <div className="glass-recessed px-2 py-1.5 rounded col-span-2 sm:col-span-1">
                    <span className="text-fog">Whey:</span> <span className="text-bone">3 heap tbsp</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Life Goals / True North Section */}
          {activeViewTab === 'goals' && (
          <div className="glass p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm text-bone flex items-center gap-2">
                <Star className="w-4 h-4 text-ember" />
                True North
              </h3>
              <span className="text-xs text-stone">Set goals in Log mode</span>
            </div>

            {lifeGoals.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-8 h-8 text-stone/50 mx-auto mb-2" />
                <p className="text-stone text-sm">No life goals yet.</p>
                <p className="text-stone/70 text-xs mt-1">Set your True North in Log mode to guide your journey.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lifeGoals.map(goal => {
                  const linkedWaypoints = waypoints.filter(w => w.goal_id === goal.id)
                  const getCategoryIcon = (category: string) => {
                    switch (category) {
                      case 'health': return <Heart className="w-4 h-4 text-ember" />
                      case 'career': return <Briefcase className="w-4 h-4 text-fjord" />
                      case 'relationships': return <Users className="w-4 h-4 text-victory-green" />
                      case 'growth': return <Brain className="w-4 h-4 text-bone" />
                      case 'financial': return <DollarSign className="w-4 h-4 text-ember" />
                      default: return <Flag className="w-4 h-4 text-stone" />
                    }
                  }

                  return (
                    <div key={goal.id} className="glass-recessed rounded-xl p-4">
                      {/* Goal Header */}
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(goal.category)}
                        <h4 className="font-medium text-bone text-sm">{goal.title}</h4>
                      </div>

                      {/* Description */}
                      {goal.description && (
                        <p className="text-xs text-fog mb-3 line-clamp-2">{goal.description}</p>
                      )}

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-stone">Progress</span>
                          <span className="text-xs text-ember font-mono">{goal.progress}%</span>
                        </div>
                        <div className="h-2 bg-iron-slate/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-ember to-ember/70 rounded-full transition-all duration-500"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Target Date */}
                      {goal.target_date && (
                        <div className="flex items-center gap-1 text-xs text-stone mb-3">
                          <Calendar className="w-3 h-3" />
                          <span>Target: {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}

                      {/* Linked Waypoints */}
                      {linkedWaypoints.length > 0 && (
                        <div className="border-t border-white/5 pt-2 mt-2">
                          <p className="text-xs text-stone uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-victory-green" />
                            Waypoints ({linkedWaypoints.length})
                          </p>
                          <div className="space-y-1">
                            {linkedWaypoints.map(waypoint => (
                              <div key={waypoint.id} className="flex items-center justify-between py-1 px-2 bg-victory-green/5 rounded-lg">
                                <div className="flex items-center gap-2 min-w-0">
                                  <CheckSquare className="w-3 h-3 text-victory-green flex-shrink-0" />
                                  <span className="text-xs text-fog truncate">{waypoint.title}</span>
                                </div>
                                <span className="text-[10px] text-stone">
                                  {new Date(waypoint.achieved_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Unlinked Waypoints */}
            {waypoints.filter(w => !w.goal_id).length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-stone uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-victory-green" />
                  General Waypoints
                </p>
                <div className="space-y-1">
                  {waypoints.filter(w => !w.goal_id).map(waypoint => (
                    <div key={waypoint.id} className="flex items-center justify-between py-2 px-3 glass-recessed rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckSquare className="w-3.5 h-3.5 text-victory-green flex-shrink-0" />
                        <span className="text-sm text-fog truncate">{waypoint.title}</span>
                      </div>
                      <span className="text-xs text-stone">
                        {new Date(waypoint.achieved_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}
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
        onSubmit={handleSetHeadingLocal}
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
      <BearingNotificationPopup
        isOpen={showBearingNotification}
        onClose={handleDismissBearingNotification}
        onFillOut={handleFillOutBearing}
        periodStart={currentWeekBounds.start}
        periodEnd={currentWeekBounds.end}
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
      <MessageDeliveryModal
        isOpen={showMessagePopup}
        message={currentDeliveredMessage}
        onClose={handleCloseMessagePopup}
        onMarkRead={handleMarkMessageRead}
        unreadCount={unreadMessages.length}
      />
      <FinanceSetupModal
        isOpen={showFinanceSetupModal}
        onClose={() => setShowFinanceSetupModal(false)}
        onSubmit={setFinanceEncryptionKey}
      />
      <FinanceAccountModal
        isOpen={showAddAccountModal}
        onClose={() => {
          setShowAddAccountModal(false)
          setEditingAccount(null)
        }}
        existingAccount={editingAccount}
        onSubmit={async (accountData) => {
          if (editingAccount) {
            await updateFinanceAccount(editingAccount.id, accountData)
          } else {
            await addFinanceAccount(accountData)
          }
        }}
        onDelete={editingAccount ? async () => {
          await deleteFinanceAccount(editingAccount.id)
          setShowAddAccountModal(false)
          setEditingAccount(null)
        } : undefined}
      />
      <SupplementDetailModal
        isOpen={showSupplementModal}
        onClose={() => {
          setShowSupplementModal(false)
          setSelectedSupplement(null)
          setSelectedSupplementPhase(null)
        }}
        supplement={selectedSupplement}
        phaseColor={selectedSupplementPhase?.color ?? 'text-ember'}
        phaseBgColor={selectedSupplementPhase?.bgColor ?? 'bg-ember/20'}
      />
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userName={userName}
        calorieGoal={calorieGoal}
        weightGoal={weightGoal}
        weights={weights}
        onUpdateUserName={handleUpdateUserName}
        onUpdateCalorieGoal={handleUpdateCalorieGoalFromSettings}
        onUpdateWeightGoal={handleUpdateWeightGoalFromSettings}
        onDeleteWeight={deleteWeight}
        onClearAllData={handleClearAllData}
        onResetOnboarding={handleResetOnboarding}
      />
    </div>
  )
}
