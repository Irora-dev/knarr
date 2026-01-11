'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Goal, X } from 'lucide-react'

interface WeightGoalModalProps {
  isOpen: boolean
  onClose: () => void
  currentGoal: number | null
  onSubmit: (goal: number) => void
}

export function WeightGoalModal({
  isOpen,
  onClose,
  currentGoal,
  onSubmit
}: WeightGoalModalProps) {
  const [value, setValue] = useState(currentGoal?.toString() ?? '')

  useEffect(() => {
    if (isOpen) {
      setValue(currentGoal?.toString() ?? '')
    }
  }, [isOpen, currentGoal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const goal = parseFloat(value)
    if (!isNaN(goal) && goal > 0) {
      onSubmit(goal)
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
            className="glass-modal p-5 sm:p-8 w-full max-w-md mx-2 sm:mx-0 relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-fjord/20 flex items-center justify-center">
                  <Goal className="w-5 h-5 text-fjord" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Set Weight Goal</h2>
                  <p className="text-fog text-sm">Your True North</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  step="0.1"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. 80.0"
                  className="input flex-1 text-lg"
                  autoFocus
                />
                <span className="text-fog text-body-md font-mono">kg</span>
              </div>

              <p className="text-stone text-sm mt-3">
                This is your target weight. We'll track your progress toward this goal.
              </p>

              <button type="submit" className="btn-primary w-full mt-6">
                Set Goal
              </button>

              {currentGoal && (
                <button
                  type="button"
                  onClick={() => {
                    onSubmit(0) // 0 means clear goal
                    onClose()
                  }}
                  className="w-full mt-3 text-stone hover:text-fog text-sm transition-colors"
                >
                  Clear Goal
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
