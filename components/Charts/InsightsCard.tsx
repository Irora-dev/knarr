'use client'

import { motion } from 'framer-motion'
import type { CalorieLog, WeightEntry, HabitLog, Habit } from '../../lib/types'

interface InsightsCardProps {
  calories: CalorieLog[]
  weights: WeightEntry[]
  habitLogs: HabitLog[]
  habits: Habit[]
  calorieGoal: number | null
}

export function InsightsCard({
  calories,
  weights,
  habitLogs,
  habits,
  calorieGoal
}: InsightsCardProps) {
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
