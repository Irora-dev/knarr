'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './auth'
import { isSupabaseConfigured } from './supabase'
import {
  calorieLogOps,
  weightEntryOps,
  habitOps,
  habitLogOps,
  taskOps,
  headingOps,
  messageOps,
  bearingOps,
  lifeGoalOps,
  waypointOps,
  financeAccountOps,
  financeTransactionOps,
  netWorthSnapshotOps,
  userProfileOps,
  settingsOps,
  userSettingsOps,
  UserSettings,
  DEFAULT_USER_SETTINGS
} from './entities'
import type { UserProfile, ProjectionSettings, BiologicalSex, ActivityLevel } from './types'
import {
  encryptObject,
  decryptObject,
  FinanceAccountData,
  FinanceTransactionData,
  NetWorthSnapshotData
} from './encryption'

// Types (duplicated from page.tsx for now - should be in shared types file)
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
  created_at?: string
}

interface HabitLog {
  id: string
  habit_id: string
  date: string
  completed: boolean
  created_at: string
}

type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly'
type TaskPriority = 'low' | 'medium' | 'high' | null
type TaskCategory = 'work' | 'personal' | 'health' | 'finance' | 'errands' | 'learning' | null

interface Task {
  id: string
  name: string
  scheduled_date: string | null
  completed: boolean
  completed_at: string | null
  recurrence: TaskRecurrence
  priority: TaskPriority
  category: TaskCategory
  created_at: string
}

interface Heading {
  id: string
  date: string
  intention: string
  completed: boolean
  created_at?: string
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
  period_start: string
  period_end: string
  wins: string[]
  challenges: string[]
  lessons: string
  focus: string
  created_at: string
}

interface LifeGoal {
  id: string
  category: 'health' | 'career' | 'relationships' | 'growth' | 'financial' | 'other'
  title: string
  description: string
  why: string
  target_date?: string
  progress: number
  created_at: string
}

interface Waypoint {
  id: string
  title: string
  description?: string
  achieved_date: string
  goal_id?: string
  created_at: string
}

// Finance types (decrypted versions for UI)
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

interface FinanceTransaction {
  id: string
  amount: number
  description: string
  category: string
  type: 'income' | 'expense' | 'transfer'
  account_id?: string
  to_account_id?: string
  date: string
  tags?: string[]
  notes?: string
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

// Local storage keys for sensitive settings (encryption key stays local for security)
const SETTINGS_KEYS = {
  financeEncryptionKey: 'knarr_finance_key', // User's encryption key for finance data - never synced to server
}

// Helper for localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : defaultValue
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function useKnarrData() {
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Use authenticated user ID or fallback for local mode
  const userId = user?.id || 'local-user'
  // Only use Supabase if configured AND we have a user (auth finished loading)
  const useSupabase = isSupabaseConfigured() && !!user && !authLoading

  // Data state
  const [calories, setCalories] = useState<CalorieLog[]>([])
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [headings, setHeadings] = useState<Heading[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [bearings, setBearings] = useState<Bearing[]>([])
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[]>([])
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])

  // Finance data (encrypted)
  const [financeAccounts, setFinanceAccounts] = useState<FinanceAccount[]>([])
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([])
  const [netWorthSnapshots, setNetWorthSnapshots] = useState<NetWorthSnapshot[]>([])
  const [financeEncryptionKey, setFinanceEncryptionKeyState] = useState<string | null>(null)

  // Settings (synced to Supabase when authenticated)
  const [userName, setUserNameState] = useState('Voyager')
  const [weightGoal, setWeightGoalState] = useState<number | null>(null)
  const [calorieGoal, setCalorieGoalState] = useState<number | null>(null)
  const [onboardingComplete, setOnboardingCompleteState] = useState(false)
  const [tutorialComplete, setTutorialCompleteState] = useState(false)

  // User profile for TDEE/projection calculations
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null)
  const [projectionSettings, setProjectionSettingsState] = useState<ProjectionSettings>({
    timeframe: '12w',
    show_confidence_bands: false
  })

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      if (useSupabase) {
        // Load from Supabase
        const [
          caloriesData,
          weightsData,
          habitsData,
          habitLogsData,
          tasksData,
          headingsData,
          messagesData,
          bearingsData,
          goalsData,
          waypointsData
        ] = await Promise.all([
          calorieLogOps.getAll(userId),
          weightEntryOps.getAll(userId),
          habitOps.getAll(userId),
          habitLogOps.getAll(userId),
          taskOps.getAll(userId),
          headingOps.getAll(userId),
          messageOps.getAll(userId),
          bearingOps.getAll(userId),
          lifeGoalOps.getAll(userId),
          waypointOps.getAll(userId)
        ])

        setCalories(caloriesData as CalorieLog[])
        setWeights(weightsData as WeightEntry[])
        setHabits(habitsData as Habit[])
        setHabitLogs(habitLogsData as HabitLog[])
        setTasks(tasksData as Task[])
        setHeadings(headingsData as Heading[])
        setMessages(messagesData as Message[])
        setBearings(bearingsData as Bearing[])
        setLifeGoals(goalsData as LifeGoal[])
        setWaypoints(waypointsData as Waypoint[])
      } else {
        // Load from localStorage (using entity ops which fall back to localStorage)
        const [
          caloriesData,
          weightsData,
          habitsData,
          habitLogsData,
          tasksData,
          headingsData,
          messagesData,
          bearingsData,
          goalsData,
          waypointsData
        ] = await Promise.all([
          calorieLogOps.getAll(userId),
          weightEntryOps.getAll(userId),
          habitOps.getAll(userId),
          habitLogOps.getAll(userId),
          taskOps.getAll(userId),
          headingOps.getAll(userId),
          messageOps.getAll(userId),
          bearingOps.getAll(userId),
          lifeGoalOps.getAll(userId),
          waypointOps.getAll(userId)
        ])

        setCalories(caloriesData as CalorieLog[])
        setWeights(weightsData as WeightEntry[])
        setHabits(habitsData as Habit[])
        setHabitLogs(habitLogsData as HabitLog[])
        setTasks(tasksData as Task[])
        setHeadings(headingsData as Heading[])
        setMessages(messagesData as Message[])
        setBearings(bearingsData as Bearing[])
        setLifeGoals(goalsData as LifeGoal[])
        setWaypoints(waypointsData as Waypoint[])
      }

      // Load user settings (from Supabase if authenticated, otherwise localStorage)
      const loadedSettings = await userSettingsOps.get(userId)
      setUserNameState(loadedSettings.userName)
      setWeightGoalState(loadedSettings.weightGoal && loadedSettings.weightGoal > 0 ? loadedSettings.weightGoal : null)
      setCalorieGoalState(loadedSettings.calorieGoal && loadedSettings.calorieGoal > 0 ? loadedSettings.calorieGoal : null)
      setOnboardingCompleteState(loadedSettings.onboardingComplete)
      setTutorialCompleteState(loadedSettings.tutorialComplete)

      // Load user profile for TDEE/projection (if it exists)
      try {
        const profileData = await userProfileOps.getAll(userId)
        if (profileData.length > 0) {
          // Use most recent profile
          const profile = profileData[0]
          setUserProfileState(profile as unknown as UserProfile)
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      }

      // Load finance encryption key
      const savedEncryptionKey = getFromStorage<string | null>(SETTINGS_KEYS.financeEncryptionKey, null)
      setFinanceEncryptionKeyState(savedEncryptionKey)

      // Load and decrypt finance data if encryption key exists
      if (savedEncryptionKey) {
        try {
          const [accountsData, transactionsData, snapshotsData] = await Promise.all([
            financeAccountOps.getAll(userId),
            financeTransactionOps.getAll(userId),
            netWorthSnapshotOps.getAll(userId)
          ])

          // Decrypt accounts
          const decryptedAccounts = await Promise.all(
            accountsData.map(async (acc: { id: string; encrypted_data: string; created_at: string }) => {
              try {
                const decrypted = await decryptObject<FinanceAccountData>(acc.encrypted_data, savedEncryptionKey)
                return { ...decrypted, id: acc.id, created_at: acc.created_at } as FinanceAccount
              } catch {
                console.error('Failed to decrypt account:', acc.id)
                return null
              }
            })
          )
          setFinanceAccounts(decryptedAccounts.filter((a): a is FinanceAccount => a !== null))

          // Decrypt transactions
          const decryptedTransactions = await Promise.all(
            transactionsData.map(async (tx: { id: string; encrypted_data: string; date: string; created_at: string }) => {
              try {
                const decrypted = await decryptObject<FinanceTransactionData>(tx.encrypted_data, savedEncryptionKey)
                return { ...decrypted, id: tx.id, date: tx.date, created_at: tx.created_at } as FinanceTransaction
              } catch {
                console.error('Failed to decrypt transaction:', tx.id)
                return null
              }
            })
          )
          setFinanceTransactions(decryptedTransactions.filter((t): t is FinanceTransaction => t !== null))

          // Decrypt net worth snapshots
          const decryptedSnapshots = await Promise.all(
            snapshotsData.map(async (snap: { id: string; encrypted_data: string; date: string; created_at: string }) => {
              try {
                const decrypted = await decryptObject<NetWorthSnapshotData>(snap.encrypted_data, savedEncryptionKey)
                return { ...decrypted, id: snap.id, date: snap.date, created_at: snap.created_at } as NetWorthSnapshot
              } catch {
                console.error('Failed to decrypt snapshot:', snap.id)
                return null
              }
            })
          )
          setNetWorthSnapshots(decryptedSnapshots.filter((s): s is NetWorthSnapshot => s !== null))
        } catch (error) {
          console.error('Error loading finance data:', error)
        }
      }

      setDataLoaded(true)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, useSupabase, authLoading])

  useEffect(() => {
    // Don't load data until auth has finished loading (if Supabase is configured)
    if (isSupabaseConfigured() && authLoading) {
      return
    }
    loadData()
  }, [loadData, authLoading])

  // CRUD operations for calories
  const addCalorie = useCallback(async (date: string, calorieCount: number) => {
    const existing = calories.find(c => c.date === date)
    if (existing) {
      const updated = await calorieLogOps.update(existing.id, { calories: calorieCount })
      setCalories(prev => prev.map(c => c.id === existing.id ? updated as CalorieLog : c))
      return updated
    } else {
      const created = await calorieLogOps.create(userId, {
        date,
        calories: calorieCount,
        created_at: new Date().toISOString()
      })
      setCalories(prev => [created as CalorieLog, ...prev])
      return created
    }
  }, [calories, userId])

  // CRUD operations for weights
  const addWeight = useCallback(async (date: string, weight: number) => {
    const existing = weights.find(w => w.date === date)
    if (existing) {
      const updated = await weightEntryOps.update(existing.id, { weight })
      setWeights(prev => prev.map(w => w.id === existing.id ? updated as WeightEntry : w))
      return updated
    } else {
      const created = await weightEntryOps.create(userId, {
        date,
        weight,
        created_at: new Date().toISOString()
      })
      setWeights(prev => [created as WeightEntry, ...prev])
      return created
    }
  }, [weights, userId])

  const deleteWeight = useCallback(async (id: string) => {
    await weightEntryOps.delete(id)
    setWeights(prev => prev.filter(w => w.id !== id))
  }, [])

  // CRUD operations for habits
  const addHabit = useCallback(async (name: string) => {
    const created = await habitOps.create(userId, {
      name,
      active: true,
      created_at: new Date().toISOString()
    })
    setHabits(prev => [created as Habit, ...prev])
    return created
  }, [userId])

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    const updated = await habitOps.update(id, updates)
    setHabits(prev => prev.map(h => h.id === id ? updated as Habit : h))
    return updated
  }, [])

  const deleteHabit = useCallback(async (id: string) => {
    await habitOps.delete(id)
    setHabits(prev => prev.filter(h => h.id !== id))
    // Also delete associated logs
    const logsToDelete = habitLogs.filter(l => l.habit_id === id)
    await Promise.all(logsToDelete.map(l => habitLogOps.delete(l.id)))
    setHabitLogs(prev => prev.filter(l => l.habit_id !== id))
  }, [habitLogs])

  // CRUD operations for habit logs
  const toggleHabitLog = useCallback(async (habitId: string, date: string) => {
    const existing = habitLogs.find(l => l.habit_id === habitId && l.date === date)
    if (existing) {
      const updated = await habitLogOps.update(existing.id, { completed: !existing.completed })
      setHabitLogs(prev => prev.map(l => l.id === existing.id ? updated as HabitLog : l))
      return updated
    } else {
      const created = await habitLogOps.create(userId, {
        habit_id: habitId,
        date,
        completed: true,
        created_at: new Date().toISOString()
      })
      setHabitLogs(prev => [created as HabitLog, ...prev])
      return created
    }
  }, [habitLogs, userId])

  // CRUD operations for tasks
  const addTask = useCallback(async (name: string, scheduledDate?: string, recurrence: TaskRecurrence = 'none', priority: TaskPriority = null, category: TaskCategory = null) => {
    const created = await taskOps.create(userId, {
      name,
      scheduled_date: scheduledDate || null,
      completed: false,
      completed_at: null,
      recurrence,
      priority,
      category,
      created_at: new Date().toISOString()
    })
    setTasks(prev => [created as Task, ...prev])
    return created
  }, [userId])

  const completeTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id)
    const updated = await taskOps.update(id, {
      completed: true,
      completed_at: new Date().toISOString()
    })
    setTasks(prev => prev.map(t => t.id === id ? updated as Task : t))

    // If task is recurring, create the next instance
    // Check explicitly for valid recurrence values (old tasks may have undefined)
    if (task && task.recurrence && task.recurrence !== 'none') {
      const baseDate = task.scheduled_date ? new Date(task.scheduled_date) : new Date()
      let nextDate: Date

      switch (task.recurrence) {
        case 'daily':
          nextDate = new Date(baseDate)
          nextDate.setDate(nextDate.getDate() + 1)
          break
        case 'weekly':
          nextDate = new Date(baseDate)
          nextDate.setDate(nextDate.getDate() + 7)
          break
        case 'monthly':
          nextDate = new Date(baseDate)
          nextDate.setMonth(nextDate.getMonth() + 1)
          break
        default:
          nextDate = new Date(baseDate)
      }

      const nextScheduledDate = nextDate.toISOString().split('T')[0]
      const nextTask = await taskOps.create(userId, {
        name: task.name,
        scheduled_date: nextScheduledDate,
        completed: false,
        completed_at: null,
        recurrence: task.recurrence,
        priority: task.priority,
        category: task.category,
        created_at: new Date().toISOString()
      })
      setTasks(prev => [nextTask as Task, ...prev])
    }

    return updated
  }, [tasks, userId])

  const deleteTask = useCallback(async (id: string) => {
    await taskOps.delete(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  // CRUD operations for headings
  const setHeading = useCallback(async (date: string, intention: string) => {
    if (!intention.trim()) return null
    const existing = headings.find(h => h.date === date)
    if (existing) {
      const updated = await headingOps.update(existing.id, { intention })
      setHeadings(prev => prev.map(h => h.id === existing.id ? updated as Heading : h))
      return updated
    } else {
      const created = await headingOps.create(userId, {
        date,
        intention,
        completed: false,
        created_at: new Date().toISOString()
      })
      setHeadings(prev => [created as Heading, ...prev])
      return created
    }
  }, [headings, userId])

  // CRUD operations for messages
  const addMessage = useCallback(async (message: Omit<Message, 'id' | 'read'>) => {
    const created = await messageOps.create(userId, {
      ...message,
      read: false
    })
    setMessages(prev => [created as Message, ...prev])
    return created
  }, [userId])

  const markMessageRead = useCallback(async (id: string) => {
    const updated = await messageOps.update(id, { read: true })
    setMessages(prev => prev.map(m => m.id === id ? updated as Message : m))
    return updated
  }, [])

  // CRUD operations for bearings
  const addBearing = useCallback(async (bearing: Omit<Bearing, 'id' | 'created_at'>) => {
    // Check if bearing exists for this period
    const existing = bearings.find(
      b => b.type === bearing.type && b.period_start === bearing.period_start
    )
    if (existing) {
      const updated = await bearingOps.update(existing.id, bearing)
      setBearings(prev => prev.map(b => b.id === existing.id ? updated as Bearing : b))
      return updated
    } else {
      const created = await bearingOps.create(userId, {
        ...bearing,
        created_at: new Date().toISOString()
      })
      setBearings(prev => [created as Bearing, ...prev])
      return created
    }
  }, [bearings, userId])

  // CRUD operations for life goals
  const addLifeGoal = useCallback(async (goal: Omit<LifeGoal, 'id' | 'created_at'>) => {
    const created = await lifeGoalOps.create(userId, {
      ...goal,
      created_at: new Date().toISOString()
    })
    setLifeGoals(prev => [created as LifeGoal, ...prev])
    return created
  }, [userId])

  const updateLifeGoal = useCallback(async (id: string, updates: Partial<LifeGoal>) => {
    const updated = await lifeGoalOps.update(id, updates)
    setLifeGoals(prev => prev.map(g => g.id === id ? updated as LifeGoal : g))
    return updated
  }, [])

  const deleteLifeGoal = useCallback(async (id: string) => {
    await lifeGoalOps.delete(id)
    setLifeGoals(prev => prev.filter(g => g.id !== id))
  }, [])

  // CRUD operations for waypoints
  const addWaypoint = useCallback(async (waypoint: Omit<Waypoint, 'id' | 'created_at'>) => {
    const created = await waypointOps.create(userId, {
      ...waypoint,
      created_at: new Date().toISOString()
    })
    setWaypoints(prev => [created as Waypoint, ...prev])
    return created
  }, [userId])

  const deleteWaypoint = useCallback(async (id: string) => {
    await waypointOps.delete(id)
    setWaypoints(prev => prev.filter(w => w.id !== id))
  }, [])

  // Finance encryption key management
  const setFinanceEncryptionKey = useCallback((key: string) => {
    setFinanceEncryptionKeyState(key)
    setToStorage(SETTINGS_KEYS.financeEncryptionKey, key)
  }, [])

  const hasFinanceKey = useCallback(() => {
    return !!financeEncryptionKey
  }, [financeEncryptionKey])

  // CRUD operations for finance accounts (encrypted)
  const addFinanceAccount = useCallback(async (account: Omit<FinanceAccount, 'id' | 'created_at'>) => {
    if (!financeEncryptionKey) throw new Error('Finance encryption key not set')

    const accountData: FinanceAccountData = {
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      institution: account.institution,
      notes: account.notes,
      is_asset: account.is_asset,
      last_updated: account.last_updated
    }

    const encrypted = await encryptObject(accountData, financeEncryptionKey)
    const now = new Date().toISOString()

    const created = await financeAccountOps.create(userId, {
      encrypted_data: encrypted,
      updated_at: now,
      created_at: now
    })

    const newAccount: FinanceAccount = {
      ...account,
      id: created.id,
      created_at: now
    }
    setFinanceAccounts(prev => [newAccount, ...prev])
    return newAccount
  }, [financeEncryptionKey, userId])

  const updateFinanceAccount = useCallback(async (id: string, updates: Partial<Omit<FinanceAccount, 'id' | 'created_at'>>) => {
    if (!financeEncryptionKey) throw new Error('Finance encryption key not set')

    const existing = financeAccounts.find(a => a.id === id)
    if (!existing) throw new Error('Account not found')

    const updatedAccount: FinanceAccount = {
      ...existing,
      ...updates,
      last_updated: new Date().toISOString()
    }

    const accountData: FinanceAccountData = {
      name: updatedAccount.name,
      type: updatedAccount.type,
      balance: updatedAccount.balance,
      currency: updatedAccount.currency,
      institution: updatedAccount.institution,
      notes: updatedAccount.notes,
      is_asset: updatedAccount.is_asset,
      last_updated: updatedAccount.last_updated
    }

    const encrypted = await encryptObject(accountData, financeEncryptionKey)

    await financeAccountOps.update(id, {
      encrypted_data: encrypted,
      updated_at: new Date().toISOString()
    })

    setFinanceAccounts(prev => prev.map(a => a.id === id ? updatedAccount : a))
    return updatedAccount
  }, [financeEncryptionKey, financeAccounts])

  const deleteFinanceAccount = useCallback(async (id: string) => {
    await financeAccountOps.delete(id)
    setFinanceAccounts(prev => prev.filter(a => a.id !== id))
  }, [])

  // CRUD operations for finance transactions (encrypted)
  const addFinanceTransaction = useCallback(async (transaction: Omit<FinanceTransaction, 'id' | 'created_at'>) => {
    if (!financeEncryptionKey) throw new Error('Finance encryption key not set')

    const txData: FinanceTransactionData = {
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      account_id: transaction.account_id,
      to_account_id: transaction.to_account_id,
      tags: transaction.tags,
      notes: transaction.notes
    }

    const encrypted = await encryptObject(txData, financeEncryptionKey)
    const now = new Date().toISOString()

    const created = await financeTransactionOps.create(userId, {
      encrypted_data: encrypted,
      date: transaction.date,
      created_at: now
    })

    const newTransaction: FinanceTransaction = {
      ...transaction,
      id: created.id,
      created_at: now
    }
    setFinanceTransactions(prev => [newTransaction, ...prev])
    return newTransaction
  }, [financeEncryptionKey, userId])

  const deleteFinanceTransaction = useCallback(async (id: string) => {
    await financeTransactionOps.delete(id)
    setFinanceTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  // Take net worth snapshot
  const takeNetWorthSnapshot = useCallback(async () => {
    if (!financeEncryptionKey) throw new Error('Finance encryption key not set')

    const assets = financeAccounts.filter(a => a.is_asset)
    const liabilities = financeAccounts.filter(a => !a.is_asset)

    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0)
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0)
    const netWorth = totalAssets - totalLiabilities

    const snapshotData: NetWorthSnapshotData = {
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      net_worth: netWorth,
      breakdown: financeAccounts.map(a => ({
        account_id: a.id,
        name: a.name,
        type: a.type,
        balance: a.balance
      }))
    }

    const encrypted = await encryptObject(snapshotData, financeEncryptionKey)
    const now = new Date().toISOString()
    const today = now.split('T')[0]!

    // Check if snapshot already exists for today
    const existingToday = netWorthSnapshots.find(s => s.date === today)
    if (existingToday) {
      await netWorthSnapshotOps.update(existingToday.id, {
        encrypted_data: encrypted
      })
      const updatedSnapshot: NetWorthSnapshot = {
        ...snapshotData,
        id: existingToday.id,
        date: today,
        created_at: existingToday.created_at
      }
      setNetWorthSnapshots(prev => prev.map(s => s.id === existingToday.id ? updatedSnapshot : s))
      return updatedSnapshot
    }

    const created = await netWorthSnapshotOps.create(userId, {
      encrypted_data: encrypted,
      date: today,
      created_at: now
    })

    const newSnapshot: NetWorthSnapshot = {
      ...snapshotData,
      id: created.id,
      date: today,
      created_at: now
    }
    setNetWorthSnapshots(prev => [newSnapshot, ...prev])
    return newSnapshot
  }, [financeEncryptionKey, financeAccounts, netWorthSnapshots, userId])

  // Settings operations (synced to Supabase when authenticated)
  const setUserName = useCallback(async (name: string) => {
    setUserNameState(name)
    await userSettingsOps.save(userId, { userName: name })
  }, [userId])

  const setWeightGoal = useCallback(async (goal: number | null) => {
    setWeightGoalState(goal)
    await userSettingsOps.save(userId, { weightGoal: goal })
  }, [userId])

  const setCalorieGoal = useCallback(async (goal: number | null) => {
    setCalorieGoalState(goal)
    await userSettingsOps.save(userId, { calorieGoal: goal })
  }, [userId])

  // Onboarding helpers (synced to Supabase)
  const getOnboardingComplete = useCallback(() => {
    return onboardingComplete
  }, [onboardingComplete])

  const setOnboardingComplete = useCallback(async (value: boolean) => {
    setOnboardingCompleteState(value)
    await userSettingsOps.save(userId, { onboardingComplete: value })
  }, [userId])

  const getTutorialComplete = useCallback(() => {
    return tutorialComplete
  }, [tutorialComplete])

  const setTutorialComplete = useCallback(async (value: boolean) => {
    setTutorialCompleteState(value)
    await userSettingsOps.save(userId, { tutorialComplete: value })
  }, [userId])

  // User profile operations for TDEE/projection calculations
  const saveUserProfile = useCallback(async (profileData: {
    height_cm: number
    birth_date: string
    biological_sex: 'male' | 'female'
    activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
    training_days_per_week: number
    tdee_override: number | null
  }) => {
    const now = new Date().toISOString()

    // Check for existing profile first
    const existingProfiles = await userProfileOps.getAll(userId)
    const existingProfile = existingProfiles.length > 0 ? existingProfiles[0] : null

    if (existingProfile) {
      // Update existing profile
      const updated = await userProfileOps.update(existingProfile.id, {
        height_cm: profileData.height_cm,
        birth_date: profileData.birth_date,
        biological_sex: profileData.biological_sex,
        activity_level: profileData.activity_level,
        training_days_per_week: profileData.training_days_per_week,
        tdee_override: profileData.tdee_override,
        updated_at: now
      })
      const fullProfile: UserProfile = {
        id: existingProfile.id,
        height_cm: profileData.height_cm,
        birth_date: profileData.birth_date,
        biological_sex: profileData.biological_sex,
        activity_level: profileData.activity_level,
        training_days_per_week: profileData.training_days_per_week,
        tdee_override: profileData.tdee_override,
        created_at: (existingProfile as unknown as UserProfile).created_at || now,
        updated_at: now
      }
      setUserProfileState(fullProfile)
      return fullProfile
    } else {
      // Create new profile
      const created = await userProfileOps.create(userId, {
        height_cm: profileData.height_cm,
        birth_date: profileData.birth_date,
        biological_sex: profileData.biological_sex,
        activity_level: profileData.activity_level,
        training_days_per_week: profileData.training_days_per_week,
        tdee_override: profileData.tdee_override,
        updated_at: now,
        created_at: now
      })
      const fullProfile: UserProfile = {
        id: created.id,
        height_cm: profileData.height_cm,
        birth_date: profileData.birth_date,
        biological_sex: profileData.biological_sex,
        activity_level: profileData.activity_level,
        training_days_per_week: profileData.training_days_per_week,
        tdee_override: profileData.tdee_override,
        created_at: now,
        updated_at: now
      }
      setUserProfileState(fullProfile)
      return fullProfile
    }
  }, [userId])

  const updateProjectionSettings = useCallback((settings: Partial<ProjectionSettings>) => {
    setProjectionSettingsState(prev => ({ ...prev, ...settings }))
  }, [])

  // Clear all data
  const clearAllData = useCallback(async () => {
    if (useSupabase) {
      // Delete all entities from Supabase
      await Promise.all([
        ...calories.map(c => calorieLogOps.delete(c.id)),
        ...weights.map(w => weightEntryOps.delete(w.id)),
        ...habits.map(h => habitOps.delete(h.id)),
        ...habitLogs.map(l => habitLogOps.delete(l.id)),
        ...tasks.map(t => taskOps.delete(t.id)),
        ...headings.map(h => headingOps.delete(h.id)),
        ...messages.map(m => messageOps.delete(m.id)),
        ...bearings.map(b => bearingOps.delete(b.id)),
        ...lifeGoals.map(g => lifeGoalOps.delete(g.id)),
        ...waypoints.map(w => waypointOps.delete(w.id)),
        ...financeAccounts.map(a => financeAccountOps.delete(a.id)),
        ...financeTransactions.map(t => financeTransactionOps.delete(t.id)),
        ...netWorthSnapshots.map(s => netWorthSnapshotOps.delete(s.id))
      ])
    }

    // Clear localStorage settings (encryption key)
    Object.values(SETTINGS_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })

    // Reset user settings (in Supabase if authenticated)
    await userSettingsOps.save(userId, DEFAULT_USER_SETTINGS)

    // Reset state
    setCalories([])
    setWeights([])
    setHabits([])
    setHabitLogs([])
    setTasks([])
    setHeadings([])
    setMessages([])
    setBearings([])
    setLifeGoals([])
    setWaypoints([])
    setFinanceAccounts([])
    setFinanceTransactions([])
    setNetWorthSnapshots([])
    setFinanceEncryptionKeyState(null)
    setUserNameState('Voyager')
    setWeightGoalState(null)
    setCalorieGoalState(null)
    setOnboardingCompleteState(false)
    setTutorialCompleteState(false)
    setUserProfileState(null)
    setProjectionSettingsState({ timeframe: '12w', show_confidence_bands: false })
  }, [useSupabase, userId, calories, weights, habits, habitLogs, tasks, headings, messages, bearings, lifeGoals, waypoints, financeAccounts, financeTransactions, netWorthSnapshots])

  return {
    // Loading state
    isLoading,
    dataLoaded,
    useSupabase,

    // Data
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

    // Settings
    userName,
    weightGoal,
    calorieGoal,
    onboardingComplete,
    tutorialComplete,

    // Calorie operations
    addCalorie,

    // Weight operations
    addWeight,
    deleteWeight,

    // Habit operations
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitLog,

    // Task operations
    addTask,
    completeTask,
    deleteTask,

    // Heading operations
    setHeading,

    // Message operations
    addMessage,
    markMessageRead,

    // Bearing operations
    addBearing,

    // Life goal operations
    addLifeGoal,
    updateLifeGoal,
    deleteLifeGoal,

    // Waypoint operations
    addWaypoint,
    deleteWaypoint,

    // Finance data
    financeAccounts,
    financeTransactions,
    netWorthSnapshots,
    financeEncryptionKey,

    // Finance operations
    setFinanceEncryptionKey,
    hasFinanceKey,
    addFinanceAccount,
    updateFinanceAccount,
    deleteFinanceAccount,
    addFinanceTransaction,
    deleteFinanceTransaction,
    takeNetWorthSnapshot,

    // Settings operations
    setUserName,
    setWeightGoal,
    setCalorieGoal,

    // Onboarding
    getOnboardingComplete,
    setOnboardingComplete,
    getTutorialComplete,
    setTutorialComplete,

    // User profile for TDEE/projections
    userProfile,
    projectionSettings,
    saveUserProfile,
    updateProjectionSettings,

    // Clear all
    clearAllData,

    // Reload data
    reloadData: loadData,
  }
}
