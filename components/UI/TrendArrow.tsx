'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function TrendArrow({ trend, goalDirection }: { trend: 'up' | 'down' | 'stable' | null; goalDirection?: 'up' | 'down' }) {
  if (!trend) return null

  const isGood = goalDirection ? trend === goalDirection : trend === 'down'
  const colorClass = trend === 'stable' ? 'text-fog' : isGood ? 'text-victory-green' : 'text-blood-red'

  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      {trend === 'up' && <TrendingUp className="w-4 h-4" />}
      {trend === 'down' && <TrendingDown className="w-4 h-4" />}
      {trend === 'stable' && <Minus className="w-4 h-4" />}
      <span className="text-xs font-medium uppercase">
        {trend === 'stable' ? 'Stable' : trend === 'up' ? 'Up' : 'Down'}
      </span>
    </div>
  )
}
