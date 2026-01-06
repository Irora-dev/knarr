import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// App configuration
export const APP_CONFIG = {
  slug: 'compass',
  appId: '4af1de6a-72cf-4fae-bf88-cbcba672bf12',
} as const
