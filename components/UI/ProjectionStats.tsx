'use client'

import { TrendingDown, TrendingUp, Calendar, Flame, Target } from 'lucide-react'

interface ProjectionStatsProps {
  tdee: number | null
  avgCalories: number | null
  deficit: number | null
  timeToGoal: { days: number; weeks: number; date: string } | null
  projectedWeight: number | null
  hasProfile: boolean
  className?: string
}

export function ProjectionStats({
  tdee,
  avgCalories,
  deficit,
  timeToGoal,
  projectedWeight,
  hasProfile,
  className = ''
}: ProjectionStatsProps) {
  const isDeficit = deficit !== null && deficit > 0
  const isSurplus = deficit !== null && deficit < 0
  const dailyChange = deficit !== null ? Math.abs(deficit) : 0

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

      {/* Average Calories */}
      <div className="glass-recessed p-3 rounded-lg">
        <div className="flex items-center gap-1.5 mb-1">
          <Target className="w-3.5 h-3.5 text-fjord" />
          <span className="text-[10px] text-stone uppercase">Avg Intake</span>
        </div>
        <div className="font-mono text-lg text-bone">
          {avgCalories ? avgCalories.toLocaleString() : '--'}
        </div>
        <div className="text-[10px] text-stone">kcal/day (14d)</div>
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
