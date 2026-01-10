'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, ChevronLeft, ChevronRight, Flame, Scale, Target } from 'lucide-react'
import { getTodayString, getDateOffset, formatShortDate } from '../../lib/dateUtils'

interface QuickLogModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'calories' | 'weight' | 'heading'
  onSubmit: (value: string, date: string) => void
}

export function QuickLogModal({
  isOpen,
  onClose,
  type,
  onSubmit
}: QuickLogModalProps) {
  const [value, setValue] = useState('')
  const [selectedDate, setSelectedDate] = useState(getTodayString())

  // Reset date when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(getTodayString())
      setValue('')
    }
  }, [isOpen])

  const config = {
    calories: { title: 'Log Calories', placeholder: 'e.g. 1700', unit: 'kcal', icon: Flame, supportsHistory: true },
    weight: { title: 'Log Weight', placeholder: 'e.g. 82.5', unit: 'kg', icon: Scale, supportsHistory: true },
    heading: { title: "Set Today's Heading", placeholder: 'What will you focus on today?', unit: '', icon: Target, supportsHistory: false },
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value, selectedDate)
      setValue('')
      setSelectedDate(getTodayString())
      onClose()
    }
  }

  const today = getTodayString()
  const isToday = selectedDate === today
  const IconComponent = config[type].icon
  const supportsHistory = config[type].supportsHistory

  // Quick date buttons for recent days
  const quickDates = [
    { label: 'Today', date: getDateOffset(0) },
    { label: 'Yesterday', date: getDateOffset(-1) },
    { label: '2 days ago', date: getDateOffset(-2) },
  ]

  const adjustDate = (days: number) => {
    const current = new Date(selectedDate + 'T00:00:00')
    current.setDate(current.getDate() + days)
    const newDate = current.toISOString().split('T')[0] ?? ''
    // Don't allow future dates
    if (newDate <= today) {
      setSelectedDate(newDate)
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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-forge-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="glass-modal p-5 sm:p-8 w-full max-w-md relative z-10 mx-2 sm:mx-0"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-ember/20 flex items-center justify-center">
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-ember" />
                </div>
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-semibold">{config[type].title}</h2>
                  {supportsHistory && !isToday && (
                    <p className="text-xs text-fjord">Logging for {formatShortDate(selectedDate)}</p>
                  )}
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
              {/* Date Selection - only for calories and weight */}
              {supportsHistory && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-fog" />
                      <span className="text-caption text-fog">DATE</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => adjustDate(-1)}
                        className="w-7 h-7 rounded-lg glass-recessed flex items-center justify-center text-fog hover:text-bone transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustDate(1)}
                        disabled={isToday}
                        className="w-7 h-7 rounded-lg glass-recessed flex items-center justify-center text-fog hover:text-bone transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {quickDates.map((qd) => (
                      <button
                        key={qd.date}
                        type="button"
                        onClick={() => setSelectedDate(qd.date)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          selectedDate === qd.date
                            ? 'bg-ember/20 text-ember border border-ember/30'
                            : 'glass-recessed text-fog hover:text-bone'
                        }`}
                      >
                        {qd.label}
                      </button>
                    ))}
                  </div>
                  {/* Custom date input */}
                  <input
                    type="date"
                    value={selectedDate}
                    max={today}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-2 w-full input text-sm"
                  />
                </div>
              )}

              <div className="flex gap-3 items-center">
                <input
                  type={type === 'heading' ? 'text' : 'number'}
                  step={type === 'weight' ? '0.1' : '1'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={config[type].placeholder}
                  className="input flex-1 text-lg"
                  autoFocus
                />
                {config[type].unit && (
                  <span className="text-fog text-body-md font-mono">{config[type].unit}</span>
                )}
              </div>

              <button type="submit" className="btn-primary w-full mt-6">
                {isToday || !supportsHistory ? 'Log Entry' : `Log for ${formatShortDate(selectedDate)}`}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
