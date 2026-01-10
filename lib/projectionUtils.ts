// Weight Projection Calculation Utilities

import type {
  BiologicalSex,
  ActivityLevel,
  UserProfile,
  ProjectionDataPoint,
  ProjectionTimeframe,
  WeightEntry
} from './types'

// Constants
export const CALORIES_PER_KG_FAT = 7700
export const CALORIES_PER_KG_MUSCLE = 5500 // Approximate - muscle requires less energy to build

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Little/no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  very_active: 1.9     // Very hard exercise, physical job
}

// Activity level descriptions for UI
export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: 'Little or no exercise, desk job',
  light: 'Light exercise 1-3 days/week',
  moderate: 'Moderate exercise 3-5 days/week',
  active: 'Hard exercise 6-7 days/week',
  very_active: 'Very hard exercise, physical job'
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate + 'T00:00:00')
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 * Most accurate for general population
 */
export function calculateBMR(
  weight_kg: number,
  height_cm: number,
  age_years: number,
  sex: BiologicalSex
): number {
  // Mifflin-St Jeor equation
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age_years
  return sex === 'male' ? base + 5 : base - 161
}

/**
 * Get activity multiplier for TDEE calculation
 */
export function getActivityMultiplier(level: ActivityLevel): number {
  return ACTIVITY_MULTIPLIERS[level]
}

/**
 * Calculate Total Daily Energy Expenditure
 * Uses Mifflin-St Jeor BMR * activity multiplier
 * Allows manual override
 */
export function calculateTDEE(
  weight_kg: number,
  height_cm: number,
  age_years: number,
  sex: BiologicalSex,
  activity_level: ActivityLevel,
  override?: number | null
): number {
  if (override) return override
  const bmr = calculateBMR(weight_kg, height_cm, age_years, sex)
  return Math.round(bmr * getActivityMultiplier(activity_level))
}

/**
 * Calculate a basic TDEE estimate when no profile is available
 * Uses simplified formula based only on weight
 * Assumes moderate activity, average height/age
 */
export function estimateBasicTDEE(weight_kg: number): number {
  // Rough estimate: 25-30 kcal per kg for moderately active adults
  // Using 27 as a middle ground
  return Math.round(weight_kg * 27)
}

/**
 * Convert timeframe to number of days
 */
export function getTimeframeDays(timeframe: ProjectionTimeframe): number {
  switch (timeframe) {
    case '4w': return 28
    case '8w': return 56
    case '12w': return 84
    case '6m': return 182
    case '1y': return 365
    default: return 84
  }
}

/**
 * Calculate average daily calories from recent logs
 * Accepts any object with date and calories properties
 */
export function calculateAverageCalories(
  calories: { date: string; calories: number }[],
  days: number = 14
): number | null {
  if (calories.length === 0) return null

  const today = new Date()
  const cutoffDate = new Date(today)
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const recentLogs = calories.filter(c => {
    const logDate = new Date(c.date + 'T00:00:00')
    return logDate >= cutoffDate
  })

  if (recentLogs.length === 0) return null

  const total = recentLogs.reduce((sum, c) => sum + c.calories, 0)
  return Math.round(total / recentLogs.length)
}

/**
 * Get the latest weight entry
 */
export function getLatestWeight(weights: WeightEntry[]): WeightEntry | null {
  if (weights.length === 0) return null
  return weights.reduce((latest, w) => {
    const latestDate = new Date(latest.date + 'T00:00:00')
    const wDate = new Date(w.date + 'T00:00:00')
    return wDate > latestDate ? w : latest
  })
}

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Project weight over time based on calorie deficit/surplus
 * Recalculates TDEE weekly as weight changes
 * Includes TDEE at each point for visualization
 * For surplus scenarios, estimates lean vs fat mass gain
 *
 * @param adaptiveMode - If true, maintains consistent deficit by reducing intake as TDEE drops
 * @param targetDeficit - The daily deficit to maintain in adaptive mode (default: calculated from initial values)
 */
export function projectWeight(
  startWeight: number,
  baseTDEE: number,
  avgDailyCalories: number,
  days: number,
  adherence: number = 1.0,
  profile?: UserProfile | null,
  adaptiveMode: boolean = false,
  targetDeficit?: number
): ProjectionDataPoint[] {
  const points: ProjectionDataPoint[] = []
  let currentWeight = startWeight
  let currentTDEE = baseTDEE
  const today = new Date()

  // Calculate initial deficit to maintain in adaptive mode
  const initialDeficit = targetDeficit ?? (baseTDEE - avgDailyCalories)
  let currentIntake = avgDailyCalories

  // Track cumulative body composition changes (for surplus scenarios)
  let cumulativeLeanGain = 0
  let cumulativeFatGain = 0

  // Determine if this is a surplus scenario
  const isSurplus = avgDailyCalories > baseTDEE
  const trainingDays = profile?.training_days_per_week ?? 3 // Default to 3 training days

  for (let day = 0; day <= days; day++) {
    // Recalculate TDEE weekly as weight changes
    // Do this BEFORE calculating deficit so TDEE reflects current weight
    if (day > 0 && day % 7 === 0) {
      if (profile && !profile.tdee_override) {
        // Use accurate calculation with profile
        currentTDEE = calculateTDEE(
          currentWeight,
          profile.height_cm,
          calculateAge(profile.birth_date),
          profile.biological_sex,
          profile.activity_level,
          null // Don't use override for dynamic recalculation
        )
      } else {
        // Use basic estimate without profile (still recalculates based on weight)
        currentTDEE = estimateBasicTDEE(currentWeight)
      }

      // In adaptive mode, adjust intake to maintain the same deficit
      if (adaptiveMode) {
        currentIntake = currentTDEE - initialDeficit
      }
    }

    // Calculate effective calories accounting for adherence
    // Adherence affects how well person sticks to their calorie goal
    const effectiveDeficit = (currentTDEE - currentIntake) * adherence

    // Apply weight change and track body composition for surplus
    if (day > 0) {
      if (isSurplus && effectiveDeficit < 0) {
        // In surplus: calculate lean vs fat gain using body composition estimation
        const dailySurplus = Math.abs(effectiveDeficit)
        const weeksElapsed = day / 7

        // Use the estimateLeanMassGain formula logic inline for daily calculation
        // Optimal surplus for muscle building: ~300-500 cal/day
        const optimalSurplus = 400
        const trainingFactor = Math.min(trainingDays / 5, 1)
        const maxDailyLeanGain = (0.2 * trainingFactor) / 7 // Max weekly lean gain / 7 for daily

        // Lean ratio decreases as surplus increases beyond optimal
        let leanRatio: number
        if (dailySurplus <= optimalSurplus) {
          // Up to optimal: high lean ratio (up to 70%)
          leanRatio = 0.7
        } else {
          // Above optimal: diminishing returns
          leanRatio = 0.7 - (dailySurplus - optimalSurplus) / 1500
          leanRatio = Math.max(0.2, leanRatio) // Minimum 20% lean
        }

        // Calculate daily gains
        const totalDailyGain = dailySurplus / CALORIES_PER_KG_FAT
        const potentialLeanGain = totalDailyGain * leanRatio
        const actualLeanGain = Math.min(potentialLeanGain, maxDailyLeanGain)
        const fatGain = totalDailyGain - actualLeanGain

        cumulativeLeanGain += actualLeanGain
        cumulativeFatGain += fatGain
        currentWeight += totalDailyGain
      } else {
        // In deficit: assume mostly fat loss
        currentWeight -= effectiveDeficit / CALORIES_PER_KG_FAT
      }
    }

    const projectionDate = addDays(today, day)

    const dataPoint: ProjectionDataPoint = {
      date: projectionDate.toISOString().split('T')[0]!,
      projected_weight: Math.round(currentWeight * 100) / 100,
      tdee: Math.round(currentTDEE),
      target_intake: Math.round(currentIntake)
    }

    // Add body composition estimates for surplus scenarios
    if (isSurplus && day > 0) {
      dataPoint.lean_mass_estimate = Math.round(cumulativeLeanGain * 100) / 100
      dataPoint.fat_mass_estimate = Math.round(cumulativeFatGain * 100) / 100
    }

    points.push(dataPoint)
  }

  return points
}

/**
 * Calculate recommended intake at a given weight to maintain a target deficit
 */
export function calculateAdaptiveIntake(
  weight: number,
  profile: UserProfile,
  targetDeficit: number
): number {
  const tdee = calculateTDEE(
    weight,
    profile.height_cm,
    calculateAge(profile.birth_date),
    profile.biological_sex,
    profile.activity_level,
    profile.tdee_override
  )
  return Math.round(tdee - targetDeficit)
}

/**
 * Estimate lean mass vs fat mass gain during a bulk
 * Based on surplus size and training frequency
 */
export function estimateLeanMassGain(
  totalSurplus: number,
  trainingDaysPerWeek: number,
  weeks: number
): { lean_mass_kg: number; fat_mass_kg: number } {
  // Maximum weekly lean mass gain potential (trained individuals)
  // 0.25 kg/week for beginners, 0.1 kg/week for advanced
  // We'll use a middle ground scaled by training frequency
  const trainingFactor = Math.min(trainingDaysPerWeek / 5, 1) // Max benefit at 5 days
  const maxWeeklyLeanGain = 0.2 * trainingFactor

  // Calculate daily surplus
  const daysTotal = weeks * 7
  const dailySurplus = totalSurplus / daysTotal

  // Optimal surplus for muscle building: ~300-500 cal/day
  // Higher surplus = more fat gain, diminishing muscle returns
  const optimalSurplus = 400

  // Lean ratio decreases as surplus increases beyond optimal
  let leanRatio: number
  if (dailySurplus <= 0) {
    // Deficit - no muscle building (simplified)
    leanRatio = 0
  } else if (dailySurplus <= optimalSurplus) {
    // Up to optimal: high lean ratio (up to 70%)
    leanRatio = 0.7
  } else {
    // Above optimal: diminishing returns
    // At 800 cal surplus, ratio drops to ~40%
    leanRatio = 0.7 - (dailySurplus - optimalSurplus) / 1500
    leanRatio = Math.max(0.2, leanRatio) // Minimum 20% lean
  }

  // Total potential weight gain from surplus
  const totalGainPotential = totalSurplus / CALORIES_PER_KG_FAT

  // Cap lean gains at physiological maximum
  const maxLeanGain = maxWeeklyLeanGain * weeks
  const leanGain = Math.min(totalGainPotential * leanRatio, maxLeanGain)
  const fatGain = Math.max(0, totalGainPotential - leanGain)

  return {
    lean_mass_kg: Math.round(leanGain * 100) / 100,
    fat_mass_kg: Math.round(fatGain * 100) / 100
  }
}

/**
 * Add milestone markers to projection data
 */
export function addMilestones(
  startWeight: number,
  goalWeight: number | null,
  projectionPoints: ProjectionDataPoint[]
): ProjectionDataPoint[] {
  if (!goalWeight || projectionPoints.length === 0) return projectionPoints

  const totalChange = Math.abs(goalWeight - startWeight)
  if (totalChange === 0) return projectionPoints

  const isLosingWeight = goalWeight < startWeight
  const milestones = [0.1, 0.25, 0.5, 0.75, 1.0]
  const milestoneLabels = ['10%', '25%', '50%', '75%', 'Goal!']

  const markedMilestones = new Set<number>()

  return projectionPoints.map(point => {
    const progressFromStart = Math.abs(point.projected_weight - startWeight)
    const progressRatio = progressFromStart / totalChange

    // Check if we've reached any milestone
    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i]!
      if (markedMilestones.has(milestone)) continue

      // Check if this point crosses the milestone threshold
      // For weight loss: weight should be <= milestone weight
      // For weight gain: weight should be >= milestone weight
      const milestoneWeight = isLosingWeight
        ? startWeight - totalChange * milestone
        : startWeight + totalChange * milestone

      const crossedMilestone = isLosingWeight
        ? point.projected_weight <= milestoneWeight
        : point.projected_weight >= milestoneWeight

      if (crossedMilestone && Math.abs(progressRatio - milestone) < 0.05) {
        markedMilestones.add(milestone)
        return {
          ...point,
          is_milestone: true,
          milestone_label: milestoneLabels[i]
        }
      }
    }

    return point
  })
}

/**
 * Estimate time to reach goal weight
 */
export function estimateTimeToGoal(
  currentWeight: number,
  goalWeight: number | null,
  dailyDeficit: number
): { days: number; weeks: number; date: string } | null {
  if (!goalWeight || dailyDeficit === 0) return null

  const weightChange = Math.abs(currentWeight - goalWeight)
  const isLosingWeight = goalWeight < currentWeight

  // Validate direction
  if (isLosingWeight && dailyDeficit < 0) return null // Can't lose weight on surplus
  if (!isLosingWeight && dailyDeficit > 0) return null // Can't gain weight on deficit

  const days = Math.ceil((weightChange * CALORIES_PER_KG_FAT) / Math.abs(dailyDeficit))
  const targetDate = addDays(new Date(), days)

  return {
    days,
    weeks: Math.ceil(days / 7),
    date: targetDate.toISOString().split('T')[0]!
  }
}

/**
 * Merge realistic, optimistic, and pessimistic projections
 * Preserves TDEE and body composition from realistic projection
 */
export function mergeProjections(
  realistic: ProjectionDataPoint[],
  optimistic: ProjectionDataPoint[],
  pessimistic: ProjectionDataPoint[]
): ProjectionDataPoint[] {
  return realistic.map((point, i) => ({
    ...point,
    optimistic_weight: optimistic[i]?.projected_weight,
    pessimistic_weight: pessimistic[i]?.projected_weight,
    tdee: point.tdee, // Preserve TDEE from realistic projection
    lean_mass_estimate: point.lean_mass_estimate, // Preserve body composition
    fat_mass_estimate: point.fat_mass_estimate
  }))
}

/**
 * Format timeframe for display
 */
export function formatTimeframe(timeframe: ProjectionTimeframe): string {
  switch (timeframe) {
    case '4w': return '4 weeks'
    case '8w': return '8 weeks'
    case '12w': return '3 months'
    case '6m': return '6 months'
    case '1y': return '1 year'
    default: return timeframe
  }
}

/**
 * Get all timeframe options for selector
 */
export const TIMEFRAME_OPTIONS: { value: ProjectionTimeframe; label: string }[] = [
  { value: '4w', label: '4 weeks' },
  { value: '8w', label: '8 weeks' },
  { value: '12w', label: '3 months' },
  { value: '6m', label: '6 months' },
  { value: '1y', label: '1 year' }
]
