'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, X, Calculator, Info } from 'lucide-react'
import type { UserProfile, BiologicalSex, ActivityLevel } from '../../lib/types'
import {
  calculateTDEE,
  calculateAge,
  calculateBMR,
  ACTIVITY_DESCRIPTIONS
} from '../../lib/projectionUtils'

interface ProjectionSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  existingProfile: UserProfile | null
  onSave: (profile: Omit<UserProfile, 'id' | 'created_at'>) => Promise<unknown>
  currentWeight: number | undefined
}

export function ProjectionSettingsModal({
  isOpen,
  onClose,
  existingProfile,
  onSave,
  currentWeight
}: ProjectionSettingsModalProps) {
  const [heightCm, setHeightCm] = useState<string>('')
  const [birthDate, setBirthDate] = useState<string>('')
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex>('male')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate')
  const [trainingDays, setTrainingDays] = useState<number>(3)
  const [tdeeOverride, setTdeeOverride] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  // Imperial conversion helper
  const [showImperial, setShowImperial] = useState(false)
  const [feet, setFeet] = useState<string>('')
  const [inches, setInches] = useState<string>('')

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && existingProfile) {
      setHeightCm(existingProfile.height_cm.toString())
      setBirthDate(existingProfile.birth_date)
      setBiologicalSex(existingProfile.biological_sex)
      setActivityLevel(existingProfile.activity_level)
      setTrainingDays(existingProfile.training_days_per_week)
      setTdeeOverride(existingProfile.tdee_override?.toString() ?? '')

      // Convert to imperial for display
      const totalInches = existingProfile.height_cm / 2.54
      setFeet(Math.floor(totalInches / 12).toString())
      setInches(Math.round(totalInches % 12).toString())
    } else if (isOpen) {
      // Default values for new profile
      setHeightCm('')
      setBirthDate('')
      setBiologicalSex('male')
      setActivityLevel('moderate')
      setTrainingDays(3)
      setTdeeOverride('')
      setFeet('')
      setInches('')
    }
  }, [isOpen, existingProfile])

  // Sync imperial to metric
  useEffect(() => {
    if (showImperial && feet && inches) {
      const totalInches = (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0)
      const cm = Math.round(totalInches * 2.54)
      if (cm > 0) setHeightCm(cm.toString())
    }
  }, [feet, inches, showImperial])

  // Calculate preview TDEE
  const calculatedTDEE = (() => {
    if (!heightCm || !birthDate || !currentWeight) return null
    const height = parseInt(heightCm)
    const age = calculateAge(birthDate)
    if (isNaN(height) || height <= 0 || age <= 0) return null

    return calculateTDEE(
      currentWeight,
      height,
      age,
      biologicalSex,
      activityLevel,
      null
    )
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const height = parseInt(heightCm)
    if (!height || !birthDate) return

    setIsSaving(true)
    try {
      await onSave({
        height_cm: height,
        birth_date: birthDate,
        biological_sex: biologicalSex,
        activity_level: activityLevel,
        training_days_per_week: trainingDays,
        tdee_override: tdeeOverride ? parseInt(tdeeOverride) : null,
        updated_at: new Date().toISOString()
      })
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
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
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-fjord/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-fjord" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Profile Setup</h2>
                  <p className="text-fog text-sm">For accurate TDEE calculation</p>
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
              {/* Height */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-caption text-stone uppercase">Height</label>
                  <button
                    type="button"
                    onClick={() => setShowImperial(!showImperial)}
                    className="text-[10px] text-fjord hover:text-bone transition-colors"
                  >
                    {showImperial ? 'Use cm' : 'Use ft/in'}
                  </button>
                </div>
                {showImperial ? (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={feet}
                          onChange={(e) => setFeet(e.target.value)}
                          placeholder="5"
                          className="input flex-1"
                          min="3"
                          max="8"
                        />
                        <span className="text-fog text-sm">ft</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={inches}
                          onChange={(e) => setInches(e.target.value)}
                          placeholder="10"
                          className="input flex-1"
                          min="0"
                          max="11"
                        />
                        <span className="text-fog text-sm">in</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="175"
                      className="input flex-1"
                      min="100"
                      max="250"
                    />
                    <span className="text-fog text-sm">cm</span>
                  </div>
                )}
              </div>

              {/* Birth Date */}
              <div>
                <label className="text-caption text-stone uppercase block mb-2">Birth Date</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="input w-full"
                  max={new Date().toISOString().split('T')[0]}
                />
                {birthDate && (
                  <p className="text-[10px] text-stone mt-1">
                    Age: {calculateAge(birthDate)} years
                  </p>
                )}
              </div>

              {/* Biological Sex */}
              <div>
                <label className="text-caption text-stone uppercase block mb-2">Biological Sex</label>
                <div className="flex gap-2">
                  {(['male', 'female'] as BiologicalSex[]).map((sex) => (
                    <button
                      key={sex}
                      type="button"
                      onClick={() => setBiologicalSex(sex)}
                      className={`
                        flex-1 px-4 py-2 rounded-lg text-sm transition-all capitalize
                        ${biologicalSex === sex
                          ? 'bg-fjord text-bone'
                          : 'glass-recessed text-stone hover:text-fog'
                        }
                      `}
                    >
                      {sex}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-stone mt-1">
                  Used for BMR calculation (Mifflin-St Jeor formula)
                </p>
              </div>

              {/* Activity Level */}
              <div>
                <label className="text-caption text-stone uppercase block mb-2">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="input w-full"
                >
                  {(Object.keys(ACTIVITY_DESCRIPTIONS) as ActivityLevel[]).map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ')} - {ACTIVITY_DESCRIPTIONS[level]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Training Days */}
              <div>
                <label className="text-caption text-stone uppercase block mb-2">
                  Training Days per Week
                </label>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setTrainingDays(day)}
                      className={`
                        flex-1 py-2 rounded-lg text-sm transition-all
                        ${trainingDays === day
                          ? 'bg-ember text-bone font-medium'
                          : 'glass-recessed text-stone hover:text-fog'
                        }
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-stone mt-1">
                  Used for lean mass gain estimates during bulk phases
                </p>
              </div>

              {/* Calculated TDEE Preview */}
              {calculatedTDEE && (
                <div className="glass-recessed p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-fjord" />
                    <span className="text-caption text-stone uppercase">Calculated TDEE</span>
                  </div>
                  <div className="font-mono text-2xl text-bone">
                    {calculatedTDEE.toLocaleString()} <span className="text-sm text-fog">kcal/day</span>
                  </div>
                </div>
              )}

              {/* TDEE Override */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-caption text-stone uppercase">TDEE Override</label>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-stone cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-iron-slate text-xs text-fog rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 text-center">
                      Override the calculated value if you know your actual TDEE
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tdeeOverride}
                    onChange={(e) => setTdeeOverride(e.target.value)}
                    placeholder={calculatedTDEE?.toString() || 'Leave blank to use calculated'}
                    className="input flex-1"
                    min="1000"
                    max="6000"
                  />
                  <span className="text-fog text-sm">kcal</span>
                </div>
                <p className="text-[10px] text-stone mt-1">
                  Optional: Set manually if you've measured your actual TDEE
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!heightCm || !birthDate || isSaving}
                className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : existingProfile ? 'Update Profile' : 'Save Profile'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
