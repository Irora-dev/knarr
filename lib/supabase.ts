import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client only if env vars are available
let supabaseInstance: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseInstance

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => !!supabaseInstance

// App configuration
export const APP_CONFIG = {
  slug: 'knarr',
  appId: '4af1de6a-72cf-4fae-bf88-cbcba672bf12',
  name: 'Knarr',
} as const

// Entity types for this app
export const ENTITY_TYPES = {
  CALORIE_LOG: 'calorie_log',
  WEIGHT_ENTRY: 'weight_entry',
  HABIT: 'habit',
  HABIT_LOG: 'habit_log',
  TASK: 'task',
  HEADING: 'heading',
  MESSAGE_BOTTLE: 'message_bottle',
  WAYPOINT: 'waypoint',
  BEARING: 'bearing',
  LIFE_GOAL: 'life_goal',
  // Finance (encrypted)
  FINANCE_ACCOUNT: 'finance_account',
  FINANCE_TRANSACTION: 'finance_transaction',
  NET_WORTH_SNAPSHOT: 'net_worth_snapshot',
  // User settings (synced to Supabase)
  USER_SETTINGS: 'user_settings',
} as const
