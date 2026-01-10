'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, X } from 'lucide-react'
import { formatPeriod } from '../../lib/dateUtils'
import type { Bearing } from '../../lib/types'

interface BearingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (bearing: Omit<Bearing, 'id' | 'created_at'>) => void
  type: 'weekly' | 'monthly'
  periodStart: string
  periodEnd: string
  existingBearing?: Bearing
}

export function BearingModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  periodStart,
  periodEnd,
  existingBearing
}: BearingModalProps) {
  const [wins, setWins] = useState<string[]>(existingBearing?.wins ?? [''])
  const [challenges, setChallenges] = useState<string[]>(existingBearing?.challenges ?? [''])
  const [lessons, setLessons] = useState(existingBearing?.lessons ?? '')
  const [focus, setFocus] = useState(existingBearing?.focus ?? '')

  useEffect(() => {
    if (isOpen) {
      setWins(existingBearing?.wins?.length ? existingBearing.wins : [''])
      setChallenges(existingBearing?.challenges?.length ? existingBearing.challenges : [''])
      setLessons(existingBearing?.lessons ?? '')
      setFocus(existingBearing?.focus ?? '')
    }
  }, [isOpen, existingBearing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      type,
      period_start: periodStart,
      period_end: periodEnd,
      wins: wins.filter(w => w.trim()),
      challenges: challenges.filter(c => c.trim()),
      lessons: lessons.trim(),
      focus: focus.trim()
    })
    onClose()
  }

  const updateList = (list: string[], setList: (v: string[]) => void, index: number, value: string) => {
    const updated = [...list]
    updated[index] = value
    setList(updated)
  }

  const addToList = (list: string[], setList: (v: string[]) => void) => {
    setList([...list, ''])
  }

  const removeFromList = (list: string[], setList: (v: string[]) => void, index: number) => {
    if (list.length > 1) {
      setList(list.filter((_, i) => i !== index))
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
                <div className="w-10 h-10 rounded-lg bg-fjord/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-fjord" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {type === 'weekly' ? 'Weekly' : 'Monthly'} Bearing
                  </h2>
                  <p className="text-fog text-sm">{formatPeriod(periodStart, periodEnd, type)}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Wins */}
              <div>
                <label className="stat-label block mb-2">Wins - What went well?</label>
                {wins.map((win, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={win}
                      onChange={(e) => updateList(wins, setWins, index, e.target.value)}
                      placeholder="Something that went well..."
                      className="input flex-1"
                    />
                    {wins.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFromList(wins, setWins, index)}
                        className="text-stone hover:text-blood-red transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addToList(wins, setWins)}
                  className="text-xs text-fjord hover:text-bone transition-colors"
                >
                  + Add another win
                </button>
              </div>

              {/* Challenges */}
              <div>
                <label className="stat-label block mb-2">Challenges - What was difficult?</label>
                {challenges.map((challenge, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={challenge}
                      onChange={(e) => updateList(challenges, setChallenges, index, e.target.value)}
                      placeholder="A challenge you faced..."
                      className="input flex-1"
                    />
                    {challenges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFromList(challenges, setChallenges, index)}
                        className="text-stone hover:text-blood-red transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addToList(challenges, setChallenges)}
                  className="text-xs text-fjord hover:text-bone transition-colors"
                >
                  + Add another challenge
                </button>
              </div>

              {/* Lessons */}
              <div>
                <label className="stat-label block mb-2">Lessons - What did you learn?</label>
                <textarea
                  value={lessons}
                  onChange={(e) => setLessons(e.target.value)}
                  placeholder="Key lessons or insights..."
                  className="input w-full h-20 resize-none"
                />
              </div>

              {/* Focus */}
              <div>
                <label className="stat-label block mb-2">Focus - What's next?</label>
                <textarea
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="Your focus for the next period..."
                  className="input w-full h-20 resize-none"
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                {existingBearing ? 'Update Bearing' : 'Save Bearing'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
