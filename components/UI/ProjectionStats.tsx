'use client'

import { TrendingDown, TrendingUp, Calendar, Flame, Target, CheckCircle2, AlertCircle } from 'lucide-react'
import type { ProgressStatus } from '../../lib/projectionUtils'

interface ProgressData {
  targetWeight: number | null
  difference: number
  status: ProgressStatus
  daysElapsed: number
}

interface ProjectionStatsProps {
  tdee: number | null
  avgCalories: number | null
  deficit: number | null
  timeToGoal: { days: number; weeks: number; date: string } | null
  projectedWeight: number | null
  hasProfile: boolean
  progress: ProgressData | null
  className?: string
}

export function ProjectionStats({
  tdee,
  avgCalories,
  deficit,
  timeToGoal,
  projectedWeight,
  hasProfile,
  progress,
  className = ''
}: ProjectionStatsProps) {
  const isDeficit = deficit !== null && deficit > 0
  const isSurplus = deficit !== null && deficit < 0
  const dailyChange = deficit !== null ? Math.abs(deficit) : 0

  // Progress status styling
  const getProgressColor = (status: ProgressStatus) => {
    switch (status) {
      case 'ahead': return 'text-victory-green'
      case 'on_track': return 'text-fjord'
      case 'behind': return 'text-amber-400'
      default: return 'text-stone'
    }
  }

  const getProgressIcon = (status: ProgressStatus) => {
    switch (status) {
      case 'ahead':
      case 'on_track':
        return <CheckCircle2 className="w-3.5 h-3.5 text-victory-green" />
      case 'behind':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
      default:
        return <Target className="w-3.5 h-3.5 text-stone" />
    }
  }

  const getProgressLabel = (status: ProgressStatus) => {
    switch (status) {
      case 'ahead': return 'Ahead'
      case 'on_track': return 'On Track'
      case 'behind': return 'Behind'
      default: return 'No Goal'
    }
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
      {/* TDEE */}
      <div className="glass-recessed p-3 rounded-lg">
        <div className="flex items-center gap-1.5 mb-1">
          <Flame className="w-3.5 h-3.5 text-ember" />
          <span className="text-[10px] text-stone uppercase">TDEE</span>
          {!hasProfile && (
            <span className="text-[8px] bg-stone/30 text-fog px-1 py-0.5 rounded">Est.</span>
          )}
        </div>
        <div className="font-mono text-lg text-bone">
          {tdee ? tdee.toLocaleString() : '--'}
        </div>
        <div className="text-[10px] text-stone">kcal/day</div>
      </div>

      {/* Progress Status */}
      <div className="glass-recessed p-3 rounded-lg">
        <div className="flex items-center gap-1.5 mb-1">
          {progress ? getProgressIcon(progress.status) : <Target className="w-3.5 h-3.5 text-stone" />}
          <span className="text-[10px] text-stone uppercase">Progress</span>
        </div>
        {progress && progress.status !== 'no_goal' ? (
          <>
            <div className={`font-mono text-lg ${getProgressColor(progress.status)}`}>
              {getProgressLabel(progress.status)}
            </div>
            <div className="text-[10px] text-stone">
              {progress.difference > 0 ? '+' : ''}{progress.difference.toFixed(1)}kg vs target
            </div>
          </>
        ) : (
          <>
            <div className="font-mono text-lg text-bone">--</div>
            <div className="text-[10px] text-stone">Set a goal</div>
          </>
        )}
      </div>

      {/* Daily Deficit/Surplus */}
      <div className="glass-recessed p-3 rounded-lg">
        <div className="flex items-center gap-1.5 mb-1">
          {isDeficit ? (
            <TrendingDown className="w-3.5 h-3.5 text-moss" />
          ) : (
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="text-[10px] text-stone uppercase">
            {isDeficit ? 'Deficit' : isSurplus ? 'Surplus' : 'Balance'}
          </span>
        </div>
        <div className={`font-mono text-lg ${isDeficit ? 'text-moss' : isSurplus ? 'text-amber-400' : 'text-bone'}`}>
          {dailyChange > 0 ? (isDeficit ? '-' : '+') + dailyChange.toLocaleString() : '--'}
        </div>
        <div className="text-[10px] text-stone">kcal/day</div>
      </div>

      {/* Time to Goal */}
      <div className="glass-recessed p-3 rounded-lg">
        <div className="flex items-center gap-1.5 mb-1">
          <Calendar className="w-3.5 h-3.5 text-fjord" />
          <span className="text-[10px] text-stone uppercase">Goal ETA</span>
        </div>
        {timeToGoal ? (
          <>
            <div className="font-mono text-lg text-bone">
              {timeToGoal.weeks}w
            </div>
            <div className="text-[10px] text-stone">
              {new Date(timeToGoal.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
            </div>
          </>
        ) : (
          <>
            <div className="font-mono text-lg text-bone">--</div>
            <div className="text-[10px] text-stone">Set a goal</div>
          </>
        )}
      </div>
    </div>
  )
}
