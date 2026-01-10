// Compass Entity Types

export interface CalorieLog {
  id: string
  user_id: string
  date: string // YYYY-MM-DD
  calories: number
  notes?: string
  created_at: string
}

export interface WeightEntry {
  id: string
  user_id: string
  date: string
  weight: number // in kg
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom'
  custom_days?: number[] // 0-6 for custom frequency
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'anytime'
  active: boolean
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  date: string
  completed: boolean
  notes?: string
  created_at: string
}

export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly'
export type TaskPriority = 'low' | 'medium' | 'high' | null
export type TaskCategory = 'work' | 'personal' | 'health' | 'finance' | 'errands' | 'learning' | null

export interface Task {
  id: string
  user_id: string
  name: string
  scheduled_date: string | null  // YYYY-MM-DD or null for "today"
  completed: boolean
  completed_at: string | null    // timestamp for animation timing
  recurrence: TaskRecurrence     // recurring pattern
  priority: TaskPriority         // task priority level
  category: TaskCategory         // task category
  created_at: string
}

export interface Heading {
  id: string
  user_id: string
  date: string
  intention: string
  completed: boolean
  created_at: string
}

export interface MessageBottle {
  id: string
  user_id: string
  content: string
  deliver_at: string // date to deliver
  trigger_type: 'date' | 'random' | 'waypoint' | 'mood'
  trigger_value?: string // for waypoint/mood triggers
  delivered: boolean
  delivered_at?: string
  created_at: string
}

export interface Waypoint {
  id: string
  title: string
  description?: string
  achieved_date: string
  goal_id?: string // Optional link to a life goal
  created_at: string
}

// Steady Course tracking
export interface SteadyCourse {
  direction: string
  current_streak: number
  best_streak: number
  last_log_date: string
  total_logs: number
}

// Dashboard summary types
export interface DirectionSummary {
  nutrition: {
    today_calories: number | null
    calorie_goal: number
    current_weight: number | null
    weight_goal: number | null
    steady_course: number
  }
  habits: {
    today_completed: number
    today_total: number
    steady_course: number
  }
}

// Message interface (simplified from MessageBottle for dashboard)
export interface Message {
  id: string
  content: string
  created_at: string
  deliver_at: string
  read: boolean
  mood?: 'hopeful' | 'grateful' | 'determined' | 'reflective'
}

// Bearing (Weekly/Monthly reflection)
export interface Bearing {
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

// Life Goal (True North)
export type LifeGoalCategory = 'health' | 'career' | 'relationships' | 'growth' | 'financial' | 'other'

export interface LifeGoal {
  id: string
  category: LifeGoalCategory
  title: string
  description: string
  why: string // Why this matters
  target_date?: string
  progress: number // 0-100
  created_at: string
}

// Finance Account
export type FinanceAccountType = 'cash' | 'checking' | 'savings' | 'investment' | 'crypto' | 'property' | 'debt' | 'other'

export interface FinanceAccount {
  id: string
  name: string
  type: FinanceAccountType
  balance: number
  currency: string
  institution?: string
  notes?: string
  is_asset: boolean
  last_updated: string
  created_at: string
}

// Net Worth Snapshot
export interface NetWorthSnapshot {
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

// Weight Projection Types
export type BiologicalSex = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type ProjectionTimeframe = '4w' | '8w' | '12w' | '6m' | '1y'

export interface UserProfile {
  id: string
  height_cm: number
  birth_date: string         // YYYY-MM-DD
  biological_sex: BiologicalSex
  activity_level: ActivityLevel
  training_days_per_week: number  // 0-7
  tdee_override: number | null
  created_at: string
  updated_at: string
}

export interface ProjectionSettings {
  timeframe: ProjectionTimeframe
  show_confidence_bands: boolean
}

export interface ProjectionDataPoint {
  date: string
  projected_weight: number
  optimistic_weight?: number
  pessimistic_weight?: number
  lean_mass_estimate?: number
  fat_mass_estimate?: number
  is_milestone?: boolean
  milestone_label?: string
}
