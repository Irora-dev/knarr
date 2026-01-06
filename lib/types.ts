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
  user_id: string
  title: string
  description?: string
  direction: 'nutrition' | 'habits' | 'general'
  achieved_at: string
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
