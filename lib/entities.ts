import { supabase, APP_CONFIG, isSupabaseConfigured } from './supabase'

// Generic entity interface from Supabase
interface Entity<T> {
  id: string
  app_id: string
  user_id: string
  entity_type: string
  data: T
  created_at: string
  updated_at: string
}

// Local storage keys
const STORAGE_PREFIX = 'knarr_'

// Helper to get localStorage data
function getLocalData<T>(entityType: string): T[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(`${STORAGE_PREFIX}${entityType}`)
  return stored ? JSON.parse(stored) : []
}

// Helper to set localStorage data
function setLocalData<T>(entityType: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${STORAGE_PREFIX}${entityType}`, JSON.stringify(data))
}

// Generate a UUID for local storage
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export interface EntityOperations<T> {
  getAll: (userId: string) => Promise<(T & { id: string })[]>
  getById: (id: string) => Promise<(T & { id: string }) | null>
  create: (userId: string, data: T) => Promise<T & { id: string }>
  update: (id: string, data: Partial<T>) => Promise<T & { id: string }>
  delete: (id: string) => Promise<void>
  query: (userId: string, filter: (item: T & { id: string }) => boolean) => Promise<(T & { id: string })[]>
}

export function createEntityOperations<T extends Record<string, unknown>>(entityType: string): EntityOperations<T> {
  return {
    async getAll(userId: string): Promise<(T & { id: string })[]> {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('entities')
          .select('*')
          .eq('app_id', APP_CONFIG.appId)
          .eq('user_id', userId)
          .eq('entity_type', entityType)
          .order('created_at', { ascending: false })

        if (error) {
          console.error(`Error fetching ${entityType}:`, error)
          return []
        }

        return (data as Entity<T>[]).map(row => ({
          ...row.data,
          id: row.id,
        }))
      }

      // Fallback to localStorage
      return getLocalData<T & { id: string }>(entityType)
    },

    async getById(id: string): Promise<(T & { id: string }) | null> {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('entities')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !data) return null
        return { ...(data as Entity<T>).data, id: data.id }
      }

      // Fallback to localStorage
      const items = getLocalData<T & { id: string }>(entityType)
      return items.find(item => item.id === id) || null
    },

    async create(userId: string, data: T): Promise<T & { id: string }> {
      const id = generateId()
      const now = new Date().toISOString()

      if (isSupabaseConfigured() && supabase) {
        const { data: created, error } = await supabase
          .from('entities')
          .insert({
            id,
            app_id: APP_CONFIG.appId,
            user_id: userId,
            entity_type: entityType,
            data,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single()

        if (error) {
          console.error(`Error creating ${entityType}:`, error)
          throw error
        }

        return { ...(created as Entity<T>).data, id: created.id }
      }

      // Fallback to localStorage
      const newItem = { ...data, id, created_at: now } as T & { id: string; created_at: string }
      const items = getLocalData<T & { id: string }>(entityType)
      items.unshift(newItem)
      setLocalData(entityType, items)
      return newItem
    },

    async update(id: string, data: Partial<T>): Promise<T & { id: string }> {
      const now = new Date().toISOString()

      if (isSupabaseConfigured() && supabase) {
        // First get the current data
        const { data: current } = await supabase
          .from('entities')
          .select('data')
          .eq('id', id)
          .single()

        if (!current) throw new Error('Entity not found')

        const updatedData = { ...current.data, ...data }

        const { data: updated, error } = await supabase
          .from('entities')
          .update({
            data: updatedData,
            updated_at: now,
          })
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.error(`Error updating ${entityType}:`, error)
          throw error
        }

        return { ...(updated as Entity<T>).data, id: updated.id }
      }

      // Fallback to localStorage
      const items = getLocalData<T & { id: string }>(entityType)
      const index = items.findIndex(item => item.id === id)
      if (index === -1) throw new Error('Entity not found')

      items[index] = { ...items[index], ...data }
      setLocalData(entityType, items)
      return items[index]
    },

    async delete(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('entities')
          .delete()
          .eq('id', id)

        if (error) {
          console.error(`Error deleting ${entityType}:`, error)
          throw error
        }
        return
      }

      // Fallback to localStorage
      const items = getLocalData<T & { id: string }>(entityType)
      const filtered = items.filter(item => item.id !== id)
      setLocalData(entityType, filtered)
    },

    async query(userId: string, filter: (item: T & { id: string }) => boolean): Promise<(T & { id: string })[]> {
      const all = await this.getAll(userId)
      return all.filter(filter)
    },
  }
}

// Pre-configured operations for each entity type
export const calorieLogOps = createEntityOperations<{
  date: string
  calories: number
  created_at: string
}>('calorie_log')

export const weightEntryOps = createEntityOperations<{
  date: string
  weight: number
  created_at: string
}>('weight_entry')

export const habitOps = createEntityOperations<{
  name: string
  active: boolean
  created_at: string
}>('habit')

export const habitLogOps = createEntityOperations<{
  habit_id: string
  date: string
  completed: boolean
  created_at: string
}>('habit_log')

export const headingOps = createEntityOperations<{
  date: string
  intention: string
  completed: boolean
  created_at: string
}>('heading')

export const messageOps = createEntityOperations<{
  content: string
  deliver_at: string
  read: boolean
  mood?: string
  created_at: string
}>('message_bottle')

export const bearingOps = createEntityOperations<{
  type: 'weekly' | 'monthly'
  period_start: string
  period_end: string
  wins: string[]
  challenges: string[]
  lessons: string
  focus: string
  created_at: string
}>('bearing')

export const lifeGoalOps = createEntityOperations<{
  category: string
  title: string
  description: string
  why: string
  target_date?: string
  progress: number
  created_at: string
}>('life_goal')

export const waypointOps = createEntityOperations<{
  title: string
  description?: string
  achieved_date: string
  goal_id?: string
  created_at: string
}>('waypoint')

// Settings stored separately (not user-specific in same way)
export const settingsOps = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    if (typeof window === 'undefined') return defaultValue
    const stored = localStorage.getItem(`${STORAGE_PREFIX}settings_${key}`)
    return stored ? JSON.parse(stored) : defaultValue
  },
  async set<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${STORAGE_PREFIX}settings_${key}`, JSON.stringify(value))
  },
}
