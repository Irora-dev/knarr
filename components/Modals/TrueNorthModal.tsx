'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { GOAL_CATEGORIES } from '../../constants/categories'
import type { LifeGoal } from '../../lib/types'

interface TrueNorthModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (goal: Omit<LifeGoal, 'id' | 'created_at' | 'progress'>) => void
  existingGoal?: LifeGoal
}

export function TrueNorthModal({
  isOpen,
  onClose,
  onSubmit,
  existingGoal
}: TrueNorthModalProps) {
  const [category, setCategory] = useState<LifeGoal['category']>(existingGoal?.category ?? 'growth')
  const [title, setTitle] = useState(existingGoal?.title ?? '')
  const [description, setDescription] = useState(existingGoal?.description ?? '')
  const [why, setWhy] = useState(existingGoal?.why ?? '')
  const [targetDate, setTargetDate] = useState(existingGoal?.target_date ?? '')

  useEffect(() => {
    if (isOpen) {
      setCategory(existingGoal?.category ?? 'growth')
      setTitle(existingGoal?.title ?? '')
      setDescription(existingGoal?.description ?? '')
      setWhy(existingGoal?.why ?? '')
      setTargetDate(existingGoal?.target_date ?? '')
    }
  }, [isOpen, existingGoal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSubmit({
        category,
        title: title.trim(),
        description: description.trim(),
        why: why.trim(),
        target_date: targetDate || undefined
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
            className="glass-modal p-5 sm:p-8 w-full max-w-lg relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ember/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-ember" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {existingGoal ? 'Edit Goal' : 'Set True North'}
                  </h2>
                  <p className="text-fog text-sm">Your long-term life goal</p>
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
              {/* Category Selection */}
              <div>
                <label className="stat-label block mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {GOAL_CATEGORIES.map((cat) => {
                    const IconComponent = cat.icon
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                          category === cat.value
                            ? 'bg-ember/20 border border-ember/30'
                            : 'glass-recessed hover:bg-iron-slate/50'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 ${cat.color}`} />
                        <span className="text-xs text-fog">{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="stat-label block mb-2">Goal</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What do you want to achieve?"
                  className="input w-full"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="stat-label block mb-2">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="More details about this goal..."
                  className="input w-full h-16 resize-none"
                />
              </div>

              {/* Why */}
              <div>
                <label className="stat-label block mb-2">Why does this matter?</label>
                <textarea
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  placeholder="Your deeper motivation..."
                  className="input w-full h-16 resize-none"
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="stat-label block mb-2">Target date (optional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="input w-full"
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                {existingGoal ? 'Update Goal' : 'Set Goal'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
