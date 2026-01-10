// Calculation utility functions for Knarr

import type { WeightEntry } from './types'

// Weight analysis helpers
export function calculateRollingAverage(weights: WeightEntry[], days: number): number | null {
  if (weights.length === 0) return null

  const sortedWeights = [...weights].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const recentWeights = sortedWeights.slice(0, days)
  if (recentWeights.length === 0) return null

  const sum = recentWeights.reduce((acc, w) => acc + w.weight, 0)
  return Math.round((sum / recentWeights.length) * 10) / 10
}

export function calculateTrend(weights: WeightEntry[]): 'up' | 'down' | 'stable' | null {
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

export function getProgressToGoal(current: number, goal: number, start?: number): number {
  // If we don't have a start weight, assume they started 10kg away from goal
  const startWeight = start ?? (goal > current ? current + 10 : current - 10)
  const totalDistance = Math.abs(startWeight - goal)
  const currentDistance = Math.abs(current - goal)
  const progress = ((totalDistance - currentDistance) / totalDistance) * 100
  return Math.max(0, Math.min(100, progress))
}

// Streak calculation with grace day recovery (1 day forgiveness)
export interface StreakResult {
  count: number
  graceDayUsed: boolean
  recentDays: { date: string; logged: boolean; isGraceDay: boolean }[]
}

export function calculateStreakWithGrace(
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
