'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, User, Flame, Goal, RefreshCw, Trash2 } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  calorieGoal: number | null
  weightGoal: number | null
  onUpdateUserName: (name: string) => void
  onUpdateCalorieGoal: (goal: number | null) => void
  onUpdateWeightGoal: (goal: number | null) => void
  onClearAllData: () => void
  onResetOnboarding: () => void
}

export function SettingsModal({
  isOpen,
  onClose,
  userName,
  calorieGoal,
  weightGoal,
  onUpdateUserName,
  onUpdateCalorieGoal,
  onUpdateWeightGoal,
  onClearAllData,
  onResetOnboarding
}: SettingsModalProps) {
  const [editedName, setEditedName] = useState(userName)
  const [editedCalorieGoal, setEditedCalorieGoal] = useState(calorieGoal?.toString() ?? '')
  const [editedWeightGoal, setEditedWeightGoal] = useState(weightGoal?.toString() ?? '')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setEditedName(userName)
      setEditedCalorieGoal(calorieGoal?.toString() ?? '')
      setEditedWeightGoal(weightGoal?.toString() ?? '')
      setShowClearConfirm(false)
    }
  }, [isOpen, userName, calorieGoal, weightGoal])

  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdateUserName(editedName.trim())
    }
  }

  const handleSaveCalorieGoal = () => {
    const goal = parseInt(editedCalorieGoal)
    if (!isNaN(goal) && goal > 0) {
      onUpdateCalorieGoal(goal)
    } else if (editedCalorieGoal === '') {
      onUpdateCalorieGoal(null)
    }
  }

  const handleSaveWeightGoal = () => {
    const goal = parseFloat(editedWeightGoal)
    if (!isNaN(goal) && goal > 0) {
      onUpdateWeightGoal(goal)
    } else if (editedWeightGoal === '') {
      onUpdateWeightGoal(null)
    }
  }

  const handleClearAllData = () => {
    onClearAllData()
    setShowClearConfirm(false)
    onClose()
  }

  const handleResetOnboarding = () => {
    onResetOnboarding()
    onClose()
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
                <div className="w-10 h-10 rounded-lg bg-fjord/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-fjord" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Settings</h2>
                  <p className="text-fog text-sm">Customize your experience</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* User Name Section */}
              <div className="space-y-2">
                <label className="text-xs text-stone uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  Display Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Your name"
                    className="input flex-1"
                  />
                  <button
                    onClick={handleSaveName}
                    className="btn-primary px-4"
                    disabled={!editedName.trim() || editedName.trim() === userName}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Calorie Goal Section */}
              <div className="space-y-2">
                <label className="text-xs text-stone uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-ember" />
                  Daily Calorie Goal
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex gap-2 items-center">
                    <input
                      type="number"
                      step="50"
                      value={editedCalorieGoal}
                      onChange={(e) => setEditedCalorieGoal(e.target.value)}
                      placeholder="e.g. 2000"
                      className="input flex-1"
                    />
                    <span className="text-fog text-sm font-mono">kcal</span>
                  </div>
                  <button
                    onClick={handleSaveCalorieGoal}
                    className="btn-primary px-4"
                    disabled={editedCalorieGoal === (calorieGoal?.toString() ?? '')}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Weight Goal Section */}
              <div className="space-y-2">
                <label className="text-xs text-stone uppercase tracking-wider flex items-center gap-2">
                  <Goal className="w-3.5 h-3.5 text-fjord" />
                  Weight Goal
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex gap-2 items-center">
                    <input
                      type="number"
                      step="0.1"
                      value={editedWeightGoal}
                      onChange={(e) => setEditedWeightGoal(e.target.value)}
                      placeholder="e.g. 80.0"
                      className="input flex-1"
                    />
                    <span className="text-fog text-sm font-mono">kg</span>
                  </div>
                  <button
                    onClick={handleSaveWeightGoal}
                    className="btn-primary px-4"
                    disabled={editedWeightGoal === (weightGoal?.toString() ?? '')}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-iron-slate/50 pt-6">
                <p className="text-xs text-stone uppercase tracking-wider mb-4">Danger Zone</p>

                {/* Reset Onboarding */}
                <button
                  onClick={handleResetOnboarding}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-iron-slate/30 hover:bg-iron-slate/50 transition-colors mb-3"
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-fog" />
                    <div className="text-left">
                      <p className="text-bone text-sm">Reset Onboarding</p>
                      <p className="text-stone text-xs">Go through the setup wizard again</p>
                    </div>
                  </div>
                </button>

                {/* Clear All Data */}
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-4 h-4 text-red-400" />
                      <div className="text-left">
                        <p className="text-red-400 text-sm">Clear All Data</p>
                        <p className="text-stone text-xs">Delete all your data permanently</p>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-red-400 text-sm font-medium mb-2">Are you sure?</p>
                    <p className="text-stone text-xs mb-4">
                      This will permanently delete all your data including calories, weights, habits, tasks, goals, and messages. This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 px-3 py-2 rounded-lg bg-iron-slate/50 text-fog hover:bg-iron-slate transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleClearAllData}
                        className="flex-1 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm"
                      >
                        Delete Everything
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
