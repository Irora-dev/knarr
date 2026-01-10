'use client'

import { motion } from 'framer-motion'
import { GOAL_CATEGORIES } from '../../constants/categories'
import type { LifeGoal } from '../../lib/types'

interface LifeGoalCardProps {
  goal: LifeGoal
  onEdit: () => void
  onUpdateProgress: (progress: number) => void
  onDelete: () => void
}

export function LifeGoalCard({
  goal,
  onEdit,
  onUpdateProgress,
  onDelete
}: LifeGoalCardProps) {
  const categoryConfig = GOAL_CATEGORIES.find(c => c.value === goal.category) ?? GOAL_CATEGORIES[5]!
  const IconComponent = categoryConfig.icon

  return (
    <motion.div
      className="glass-recessed p-4 rounded-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconComponent className={`w-4 h-4 ${categoryConfig.color}`} />
          <span className="text-xs text-stone uppercase">{categoryConfig.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="text-xs text-stone hover:text-fog transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-stone hover:text-blood-red transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <h4 className="font-display text-bone font-semibold mb-2">{goal.title}</h4>

      {goal.why && (
        <p className="text-fog text-sm mb-3 italic">"{goal.why}"</p>
      )}

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-caption text-fog">Progress</span>
          <span className="font-mono text-sm text-ember">{goal.progress}%</span>
        </div>
        <div className="progress-bar h-2">
          <motion.div
            className="progress-fill progress-fill-ember"
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Quick progress buttons */}
      <div className="flex gap-1 justify-end">
        {[0, 25, 50, 75, 100].map((p) => (
          <button
            key={p}
            onClick={() => onUpdateProgress(p)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              goal.progress === p
                ? 'bg-ember/30 text-ember'
                : 'glass-recessed text-stone hover:text-fog'
            }`}
          >
            {p}%
          </button>
        ))}
      </div>

      {goal.target_date && (
        <div className="mt-3 text-xs text-stone">
          Target: {new Date(goal.target_date + 'T00:00:00').toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      )}
    </motion.div>
  )
}
