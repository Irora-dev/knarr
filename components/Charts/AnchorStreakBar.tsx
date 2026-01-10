'use client'

import { motion } from 'framer-motion'
import { Anchor } from 'lucide-react'
import type { StreakResult } from '../../lib/calculationUtils'
import { formatShortDate } from '../../lib/dateUtils'

export function AnchorStreakBar({ streakData }: { streakData: StreakResult }) {
  const { count, graceDayUsed, recentDays } = streakData

  // Show last 7 days in reverse order (most recent first, display left to right)
  const displayDays = recentDays.slice(0, 7).reverse()

  return (
    <motion.div
      className="anchor-streak-bar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Anchor + Streak Count */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="anchor-icon-container">
              <Anchor className="w-4 h-4 sm:w-5 sm:h-5 text-fjord" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-xl sm:text-2xl font-bold text-ember">{count}</span>
              <span className="text-xs sm:text-sm text-fog">day streak</span>
            </div>
            {graceDayUsed && (
              <motion.div
                className="grace-day-badge"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                title="Your streak was saved! One grace day was used."
              >
                <span className="text-[10px] sm:text-xs text-victory-green font-medium">Anchored</span>
              </motion.div>
            )}
          </div>

          {/* Right: Day chain visualization */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {displayDays.map((day, index) => {
              const dayLabel = new Date(day.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).charAt(0)
              return (
                <div key={day.date} className="flex flex-col items-center gap-0.5">
                  <motion.div
                    className={`streak-day-dot ${
                      day.logged ? 'logged' :
                      day.isGraceDay ? 'grace' :
                      'missed'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    title={
                      day.isGraceDay
                        ? `${formatShortDate(day.date)} - Grace day (streak saved!)`
                        : day.logged
                        ? `${formatShortDate(day.date)} - Logged`
                        : `${formatShortDate(day.date)} - No log`
                    }
                  >
                    {day.isGraceDay && (
                      <Anchor className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-fjord" />
                    )}
                  </motion.div>
                  <span className="text-[8px] sm:text-[10px] text-stone hidden sm:block">{dayLabel}</span>
                </div>
              )
            })}
            {count > 7 && (
              <span className="text-[10px] sm:text-xs text-stone ml-1">+{count - 7}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
