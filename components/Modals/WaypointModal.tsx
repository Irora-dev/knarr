'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag, X } from 'lucide-react'
import { getTodayString } from '../../lib/dateUtils'
import type { LifeGoal, Waypoint } from '../../lib/types'

interface WaypointModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (waypoint: Omit<Waypoint, 'id' | 'created_at'>) => void
  lifeGoals: LifeGoal[]
  existingWaypoint?: Waypoint
}

export function WaypointModal({
  isOpen,
  onClose,
  onSubmit,
  lifeGoals,
  existingWaypoint
}: WaypointModalProps) {
  const [title, setTitle] = useState(existingWaypoint?.title ?? '')
  const [description, setDescription] = useState(existingWaypoint?.description ?? '')
  const [achievedDate, setAchievedDate] = useState(existingWaypoint?.achieved_date ?? getTodayString())
  const [goalId, setGoalId] = useState(existingWaypoint?.goal_id ?? '')

  useEffect(() => {
    if (isOpen) {
      setTitle(existingWaypoint?.title ?? '')
      setDescription(existingWaypoint?.description ?? '')
      setAchievedDate(existingWaypoint?.achieved_date ?? getTodayString())
      setGoalId(existingWaypoint?.goal_id ?? '')
    }
  }, [isOpen, existingWaypoint])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        achieved_date: achievedDate,
        goal_id: goalId || undefined
      })
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="glass-modal p-5 sm:p-8 w-full max-w-md relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-victory-green/20 flex items-center justify-center">
                  <Flag className="w-5 h-5 text-victory-green" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {existingWaypoint ? 'Edit Waypoint' : 'Log Milestone'}
                  </h2>
                  <p className="text-fog text-sm">Mark an achievement</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="stat-label block mb-2">What did you achieve?</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., First 5k run, Launched my website"
                  className="input w-full"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="stat-label block mb-2">Details (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="How it happened, how you felt..."
                  className="input w-full h-20 resize-none"
                />
              </div>

              <div>
                <label className="stat-label block mb-2">When?</label>
                <input
                  type="date"
                  value={achievedDate}
                  max={getTodayString()}
                  onChange={(e) => setAchievedDate(e.target.value)}
                  className="input w-full"
                />
              </div>

              {lifeGoals.length > 0 && (
                <div>
                  <label className="stat-label block mb-2">Related to goal (optional)</label>
                  <select
                    value={goalId}
                    onChange={(e) => setGoalId(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">No specific goal</option>
                    {lifeGoals.map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <button type="submit" className="btn-primary w-full">
                {existingWaypoint ? 'Update Waypoint' : 'Log Milestone'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
