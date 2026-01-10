'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Compass as CompassIcon } from 'lucide-react'

interface BearingNotificationPopupProps {
  isOpen: boolean
  onClose: () => void
  onFillOut: () => void
  type: 'weekly' | 'monthly'
  periodStart: string
  periodEnd: string
}

export function BearingNotificationPopup({
  isOpen,
  onClose,
  onFillOut,
  type,
  periodStart,
  periodEnd
}: BearingNotificationPopupProps) {
  const formatPeriodDisplay = () => {
    const start = new Date(periodStart + 'T00:00:00')
    const end = new Date(periodEnd + 'T00:00:00')
    if (type === 'monthly') {
      return start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    }
    return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
  }

  const isMonthly = type === 'monthly'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          >
            {/* Floating compass animation */}
            <motion.div
              className="flex justify-center mb-4"
              animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ember/30 to-ember/10 flex items-center justify-center border border-ember/30 shadow-lg shadow-ember/20">
                <CompassIcon className="w-10 h-10 text-ember" />
              </div>
            </motion.div>

            <div className="glass-modal p-6 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">{isMonthly ? '📅' : '🧭'}</span>
                <h2 className="font-display text-xl text-bone">
                  {isMonthly ? 'Monthly Review' : 'Time to Reflect'}
                </h2>
              </div>

              <p className="text-sm text-stone mb-2">
                Your {isMonthly ? 'monthly' : 'weekly'} bearing is due
              </p>

              <div className={`glass-recessed px-3 py-2 rounded-lg mb-4 inline-block ${isMonthly ? 'border border-ember/20' : ''}`}>
                <span className={`text-xs font-medium ${isMonthly ? 'text-ember' : 'text-fjord'}`}>{formatPeriodDisplay()}</span>
              </div>

              <p className="text-fog text-sm mb-6 leading-relaxed">
                {isMonthly
                  ? 'Take a moment to reflect on the bigger picture - your wins, challenges, and lessons from this month.'
                  : 'Take a moment to reflect on your wins, challenges, and lessons from this week.'}
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={onFillOut}
                  className="btn-primary w-full"
                >
                  Fill Out Now
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-stone hover:text-fog transition-colors"
                >
                  Remind Me Later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
