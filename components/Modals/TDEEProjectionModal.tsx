'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Flame, TrendingDown, Info } from 'lucide-react'
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts'
import type { ProjectionDataPoint } from '../../lib/types'

interface TDEEProjectionModalProps {
  isOpen: boolean
  onClose: () => void
  projectionData: ProjectionDataPoint[]
  currentTDEE: number
  hasProfile: boolean
}

export function TDEEProjectionModal({
  isOpen,
  onClose,
  projectionData,
  currentTDEE,
  hasProfile
}: TDEEProjectionModalProps) {
  // Sample weekly TDEE values for the chart
  const weeklyTDEEData = projectionData
    .filter((_, i) => i % 7 === 0) // Get weekly samples
    .map(p => ({
      date: p.date,
      displayDate: new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      tdee: p.tdee ?? currentTDEE,
      weight: p.projected_weight,
      targetIntake: p.target_intake
    }))

  // Calculate TDEE and intake changes
  const startTDEE = weeklyTDEEData[0]?.tdee ?? currentTDEE
  const endTDEE = weeklyTDEEData[weeklyTDEEData.length - 1]?.tdee ?? currentTDEE
  const tdeeChange = endTDEE - startTDEE
  const startIntake = weeklyTDEEData[0]?.targetIntake
  const endIntake = weeklyTDEEData[weeklyTDEEData.length - 1]?.targetIntake
  const intakeChange = startIntake && endIntake ? endIntake - startIntake : null
  const hasAdaptiveData = weeklyTDEEData.some(w => w.targetIntake !== weeklyTDEEData[0]?.targetIntake)

  // Calculate Y-axis domain for TDEE
  const tdeeValues = weeklyTDEEData.map(d => d.tdee)
  const minTDEE = Math.min(...tdeeValues)
  const maxTDEE = Math.max(...tdeeValues)
  const padding = Math.max(50, (maxTDEE - minTDEE) * 0.1)

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
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ember/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-ember" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">TDEE Projection</h2>
                  <p className="text-fog text-sm">How your metabolism changes</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Box */}
            <div className="glass-recessed p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-fjord mt-0.5 flex-shrink-0" />
                <p className="text-sm text-fog">
                  As you lose weight, your body requires fewer calories to maintain itself.
                  This projection shows how your TDEE (Total Daily Energy Expenditure) will
                  decrease over time, helping you understand why weight loss may slow down.
                </p>
              </div>
            </div>

            {/* Current vs Projected TDEE */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-recessed p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-3.5 h-3.5 text-ember" />
                  <span className="text-[10px] text-stone uppercase">Current TDEE</span>
                </div>
                <p className="font-mono text-2xl text-bone">{startTDEE.toLocaleString()}</p>
                <p className="text-xs text-stone">kcal/day</p>
              </div>

              <div className="glass-recessed p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-3.5 h-3.5 text-fjord" />
                  <span className="text-[10px] text-stone uppercase">Projected TDEE</span>
                </div>
                <p className="font-mono text-2xl text-bone">{endTDEE.toLocaleString()}</p>
                <p className="text-xs text-stone">
                  {tdeeChange !== 0 && (
                    <span className={tdeeChange < 0 ? 'text-amber-400' : 'text-moss'}>
                      {tdeeChange > 0 ? '+' : ''}{tdeeChange} kcal
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* TDEE Chart */}
            <div className="mb-4">
              <h3 className="text-xs text-stone uppercase mb-3">TDEE Over Time</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={weeklyTDEEData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tdeeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F97316" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="displayDate"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      interval="preserveStartEnd"
                    />

                    <YAxis
                      domain={[Math.floor(minTDEE - padding), Math.ceil(maxTDEE + padding)]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickFormatter={(value) => `${value}`}
                    />

                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0]?.payload as { tdee: number; weight: number } | undefined
                        return (
                          <div className="chart-tooltip">
                            <p className="text-caption text-fog mb-1">{label}</p>
                            <p className="font-mono text-sm text-ember">
                              {data?.tdee?.toLocaleString()} kcal/day
                            </p>
                            <p className="font-mono text-xs text-stone">
                              at {data?.weight?.toFixed(1)} kg
                            </p>
                          </div>
                        )
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="tdee"
                      stroke="none"
                      fill="url(#tdeeGradient)"
                    />

                    <Line
                      type="monotone"
                      dataKey="tdee"
                      stroke="#F97316"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#1C1C1E', stroke: '#F97316', strokeWidth: 2 }}
                      activeDot={{ r: 5, fill: '#F97316', stroke: '#1C1C1E', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Adaptive Intake Info */}
            {hasAdaptiveData && intakeChange && (
              <div className="glass-recessed p-4 rounded-lg mb-4 border border-moss/20">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-4 h-4 text-moss mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-bone font-medium mb-1">Adaptive Intake Active</p>
                    <p className="text-xs text-fog">
                      To maintain your current deficit as you lose weight, your intake target will
                      reduce from <span className="font-mono text-moss">{startIntake?.toLocaleString()}</span> to{' '}
                      <span className="font-mono text-moss">{endIntake?.toLocaleString()}</span> kcal/day
                      ({intakeChange > 0 ? '+' : ''}{intakeChange} kcal).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Breakdown Table */}
            <div>
              <h3 className="text-xs text-stone uppercase mb-3">Weekly Breakdown</h3>
              <div className="glass-recessed rounded-lg overflow-hidden">
                <div className={`grid ${hasAdaptiveData ? 'grid-cols-4' : 'grid-cols-3'} gap-2 p-2 text-[10px] text-stone uppercase border-b border-white/5`}>
                  <span>Week</span>
                  <span className="text-right">Weight</span>
                  <span className="text-right">TDEE</span>
                  {hasAdaptiveData && <span className="text-right">Target</span>}
                </div>
                <div className="max-h-[150px] overflow-y-auto">
                  {weeklyTDEEData.slice(0, 12).map((week, index) => (
                    <div
                      key={week.date}
                      className={`grid ${hasAdaptiveData ? 'grid-cols-4' : 'grid-cols-3'} gap-2 p-2 text-sm border-b border-white/5 last:border-0`}
                    >
                      <span className="text-fog">Week {index + 1}</span>
                      <span className="text-right font-mono text-bone">{week.weight.toFixed(1)} kg</span>
                      <span className="text-right font-mono text-ember">{week.tdee.toLocaleString()}</span>
                      {hasAdaptiveData && (
                        <span className="text-right font-mono text-moss">{week.targetIntake?.toLocaleString() ?? '-'}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!hasProfile && (
              <p className="text-xs text-stone mt-4 text-center">
                Set up your profile for more accurate TDEE calculations
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
