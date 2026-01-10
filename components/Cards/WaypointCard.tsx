'use client'

import { motion } from 'framer-motion'
import { Trophy, Star } from 'lucide-react'
import type { Waypoint, LifeGoal } from '../../lib/types'

interface WaypointCardProps {
  waypoint: Waypoint
  linkedGoal?: LifeGoal
  onDelete: () => void
}

export function WaypointCard({ waypoint, linkedGoal, onDelete }: WaypointCardProps) {
  const achievedDate = new Date(waypoint.achieved_date + 'T00:00:00')
  const daysAgo = Math.floor((Date.now() - achievedDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <motion.div
      className="glass-recessed p-4 rounded-lg border-l-2 border-victory-green"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-victory-green" />
          <span className="text-caption text-stone">
            {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="text-xs text-stone hover:text-blood-red transition-colors"
        >
          Delete
        </button>
      </div>

      <h4 className="font-display text-bone font-semibold mb-1">{waypoint.title}</h4>

      {waypoint.description && (
        <p className="text-fog text-sm mb-2">{waypoint.description}</p>
      )}

      {linkedGoal && (
        <div className="flex items-center gap-1 text-xs text-fjord">
          <Star className="w-3 h-3" />
          <span>{linkedGoal.title}</span>
        </div>
      )}
    </motion.div>
  )
}
