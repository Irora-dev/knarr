'use client'

import { motion } from 'framer-motion'
import { formatPeriod } from '../../lib/dateUtils'
import type { Bearing } from '../../lib/types'

interface BearingDisplayCardProps {
  bearing: Bearing
  onEdit: () => void
}

export function BearingDisplayCard({ bearing, onEdit }: BearingDisplayCardProps) {
  return (
    <motion.div
      className="glass-recessed p-4 rounded-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            bearing.type === 'weekly' ? 'bg-fjord/30 text-fjord' : 'bg-ember/30 text-ember'
          }`}>
            {bearing.type === 'weekly' ? 'Weekly' : 'Monthly'}
          </span>
          <span className="text-caption text-stone">
            {formatPeriod(bearing.period_start, bearing.period_end, bearing.type)}
          </span>
        </div>
        <button
          onClick={onEdit}
          className="text-xs text-stone hover:text-fog transition-colors"
        >
          Edit
        </button>
      </div>

      {bearing.wins.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-victory-green mb-1">Wins</p>
          <ul className="text-fog text-sm space-y-0.5">
            {bearing.wins.map((win, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-victory-green">•</span>
                {win}
              </li>
            ))}
          </ul>
        </div>
      )}

      {bearing.focus && (
        <div className="glass-recessed p-2 rounded text-sm">
          <span className="text-caption text-stone">Focus: </span>
          <span className="text-fog">{bearing.focus}</span>
        </div>
      )}
    </motion.div>
  )
}
