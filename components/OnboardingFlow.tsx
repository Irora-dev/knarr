'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  Compass,
  User,
  Target,
  Scale,
  Flame,
  CheckSquare,
  Anchor,
  Sparkles,
  Activity
} from 'lucide-react'

type BiologicalSex = 'male' | 'female'
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

interface OnboardingData {
  name: string
  focusAreas: string[]
  weightGoal: number | null
  currentWeight: number | null
  calorieGoal: number | null
  initialHabits: string[]
  // Profile data for TDEE
  heightCm: number | null
  birthDate: string | null
  biologicalSex: BiologicalSex | null
  activityLevel: ActivityLevel | null
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void
}

const FOCUS_AREAS = [
  { id: 'nutrition', label: 'Nutrition', icon: Flame, description: 'Track calories and meals' },
  { id: 'weight', label: 'Weight', icon: Scale, description: 'Monitor weight trends' },
  { id: 'habits', label: 'Habits', icon: CheckSquare, description: 'Build daily routines' },
  { id: 'goals', label: 'Life Goals', icon: Target, description: 'Long-term aspirations' },
]

const SUGGESTED_HABITS = [
  'Morning routine',
  'Exercise',
  'Read 30 minutes',
  'Meditate',
  'Drink 8 glasses of water',
  'No phone before bed',
  'Journal',
  'Take vitamins',
]

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise, desk job' },
  { value: 'light', label: 'Light', description: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
  { value: 'very_active', label: 'Very Active', description: 'Very hard exercise, physical job' },
]

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    name: '',
    focusAreas: [],
    weightGoal: null,
    currentWeight: null,
    calorieGoal: null,
    initialHabits: [],
    heightCm: null,
    birthDate: null,
    biologicalSex: null,
    activityLevel: null,
  })
  const [customHabit, setCustomHabit] = useState('')
  const [showHeightImperial, setShowHeightImperial] = useState(false)
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')

  const totalSteps = 6 // Added profile step

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const toggleFocusArea = (id: string) => {
    setData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(id)
        ? prev.focusAreas.filter(a => a !== id)
        : [...prev.focusAreas, id]
    }))
  }

  const toggleHabit = (habit: string) => {
    setData(prev => ({
      ...prev,
      initialHabits: prev.initialHabits.includes(habit)
        ? prev.initialHabits.filter(h => h !== habit)
        : [...prev.initialHabits, habit]
    }))
  }

  const addCustomHabit = () => {
    if (customHabit.trim() && !data.initialHabits.includes(customHabit.trim())) {
      setData(prev => ({
        ...prev,
        initialHabits: [...prev.initialHabits, customHabit.trim()]
      }))
      setCustomHabit('')
    }
  }

  const canProceed = () => {
    switch (step) {
      case 0: return data.name.trim().length > 0
      case 1: return data.focusAreas.length > 0
      case 2: return true // Weight is optional
      case 3: return true // Profile is optional
      case 4: return true // Calories is optional
      case 5: return true // Habits are optional
      default: return true
    }
  }

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      onComplete(data)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-ember/20 flex items-center justify-center">
                <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-ember" />
              </div>
              <h2 className="font-display text-xl sm:text-2xl text-bone mb-2">Welcome to Knarr</h2>
              <p className="text-fog text-sm sm:text-base">Your personal command centre for life. Let's set you up.</p>
            </div>

            <div>
              <label className="block text-xs text-stone uppercase tracking-wider mb-2">
                What should we call you?
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateData({ name: e.target.value })}
                  placeholder="Captain"
                  className="input pl-10"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )

      case 1:
        return (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="font-display text-xl sm:text-2xl text-bone mb-2">Choose Your Focus</h2>
              <p className="text-fog text-sm sm:text-base">What areas of life do you want to track?</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {FOCUS_AREAS.map((area) => {
                const Icon = area.icon
                const isSelected = data.focusAreas.includes(area.id)
                return (
                  <button
                    key={area.id}
                    onClick={() => toggleFocusArea(area.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-ember/20 border-ember/50 ring-1 ring-ember/30'
                        : 'bg-iron-slate/30 border-iron-slate/50 hover:bg-iron-slate/50'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-ember' : 'text-fog'}`} />
                    <p className={`font-medium ${isSelected ? 'text-bone' : 'text-fog'}`}>{area.label}</p>
                    <p className="text-xs text-stone mt-1">{area.description}</p>
                  </button>
                )
              })}
            </div>

            <p className="text-center text-stone text-xs">Select at least one to continue</p>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-fjord-blue/20 flex items-center justify-center">
                <Scale className="w-7 h-7 sm:w-8 sm:h-8 text-fjord-blue" />
              </div>
              <h2 className="font-display text-xl sm:text-2xl text-bone mb-2">Weight Tracking</h2>
              <p className="text-fog text-sm sm:text-base">Optional: Set up weight tracking goals</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-stone uppercase tracking-wider mb-2">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={data.currentWeight || ''}
                  onChange={(e) => updateData({ currentWeight: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="e.g. 75.5"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs text-stone uppercase tracking-wider mb-2">
                  Goal Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={data.weightGoal || ''}
                  onChange={(e) => updateData({ weightGoal: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="e.g. 70.0"
                  className="input"
                />
              </div>
            </div>

            <p className="text-center text-stone text-xs">You can skip this and set it up later</p>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-fjord-blue/20 flex items-center justify-center">
                <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-fjord-blue" />
              </div>
              <h2 className="font-display text-xl sm:text-2xl text-bone mb-2">Your Profile</h2>
              <p className="text-fog text-sm sm:text-base">Optional: For accurate calorie projections</p>
            </div>

            <div className="space-y-4">
              {/* Height */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-stone uppercase tracking-wider">Height</label>
                  <button
                    type="button"
                    onClick={() => setShowHeightImperial(!showHeightImperial)}
                    className="text-[10px] text-fjord-blue hover:text-bone transition-colors"
                  >
                    {showHeightImperial ? 'Use cm' : 'Use ft/in'}
                  </button>
                </div>
                {showHeightImperial ? (
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="number"
                        value={heightFeet}
                        onChange={(e) => {
                          setHeightFeet(e.target.value)
                          const totalInches = (parseInt(e.target.value) || 0) * 12 + (parseInt(heightInches) || 0)
                          updateData({ heightCm: Math.round(totalInches * 2.54) || null })
                        }}
                        placeholder="5"
                        className="input flex-1"
                        min="3"
                        max="8"
                      />
                      <span className="text-fog text-sm">ft</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="number"
                        value={heightInches}
                        onChange={(e) => {
                          setHeightInches(e.target.value)
                          const totalInches = (parseInt(heightFeet) || 0) * 12 + (parseInt(e.target.value) || 0)
                          updateData({ heightCm: Math.round(totalInches * 2.54) || null })
                        }}
                        placeholder="10"
                        className="input flex-1"
                        min="0"
                        max="11"
                      />
                      <span className="text-fog text-sm">in</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={data.heightCm || ''}
                      onChange={(e) => updateData({ heightCm: e.target.value ? parseInt(e.target.value) : null })}
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
                <label className="block text-xs text-stone uppercase tracking-wider mb-2">Birth Date</label>
                <input
                  type="date"
                  value={data.birthDate || ''}
                  onChange={(e) => updateData({ birthDate: e.target.value || null })}
                  className="input w-full"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Biological Sex */}
              <div>
                <label className="block text-xs text-stone uppercase tracking-wider mb-2">Biological Sex</label>
                <div className="flex gap-2">
                  {(['male', 'female'] as BiologicalSex[]).map((sex) => (
                    <button
                      key={sex}
                      type="button"
                      onClick={() => updateData({ biologicalSex: sex })}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm transition-all capitalize ${
                        data.biologicalSex === sex
                          ? 'bg-fjord-blue text-bone'
                          : 'bg-iron-slate/30 border border-iron-slate/50 text-fog hover:bg-iron-slate/50'
                      }`}
                    >
                      {sex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-xs text-stone uppercase tracking-wider mb-2">Activity Level</label>
                <div className="space-y-2">
                  {ACTIVITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateData({ activityLevel: option.value })}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        data.activityLevel === option.value
                          ? 'bg-fjord-blue/20 border border-fjord-blue/50'
                          : 'bg-iron-slate/30 border border-iron-slate/50 hover:bg-iron-slate/50'
                      }`}
                    >
                      <p className={`font-medium text-sm ${data.activityLevel === option.value ? 'text-bone' : 'text-fog'}`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-stone">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-center text-stone text-xs">This helps calculate your daily energy expenditure</p>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-ember/20 flex items-center justify-center">
                <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-ember" />
              </div>
              <h2 className="font-display text-xl sm:text-2xl text-bone mb-2">Calorie Target</h2>
              <p className="text-fog text-sm sm:text-base">Optional: Set your daily calorie goal</p>
            </div>

            <div>
              <label className="block text-xs text-stone uppercase tracking-wider mb-2">
                Daily Calorie Goal
              </label>
              <input
                type="number"
                value={data.calorieGoal || ''}
                onChange={(e) => updateData({ calorieGoal: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="e.g. 2000"
                className="input"
              />
              <p className="text-xs text-stone mt-2">
                Typical range: 1500-2500 kcal depending on your goals
              </p>
            </div>

            <p className="text-center text-stone text-xs">You can skip this and set it up later</p>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            key="step-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-victory-green/20 flex items-center justify-center">
                <CheckSquare className="w-7 h-7 sm:w-8 sm:h-8 text-victory-green" />
              </div>
              <h2 className="font-display text-xl sm:text-2xl text-bone mb-2">Daily Habits</h2>
              <p className="text-fog text-sm sm:text-base">Choose habits to track daily</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {SUGGESTED_HABITS.map((habit) => {
                const isSelected = data.initialHabits.includes(habit)
                return (
                  <button
                    key={habit}
                    onClick={() => toggleHabit(habit)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      isSelected
                        ? 'bg-victory-green/20 text-victory-green border border-victory-green/50'
                        : 'bg-iron-slate/30 text-fog border border-iron-slate/50 hover:bg-iron-slate/50'
                    }`}
                  >
                    {habit}
                  </button>
                )
              })}
            </div>

            {/* Custom habit input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customHabit}
                onChange={(e) => setCustomHabit(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomHabit()}
                placeholder="Add custom habit..."
                className="input flex-1"
              />
              <button
                onClick={addCustomHabit}
                disabled={!customHabit.trim()}
                className="btn-secondary px-4 disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {data.initialHabits.length > 0 && (
              <div className="p-3 rounded-lg bg-victory-green/10 border border-victory-green/20">
                <p className="text-xs text-victory-green font-medium mb-1">Selected habits:</p>
                <p className="text-sm text-bone">{data.initialHabits.join(', ')}</p>
              </div>
            )}
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/wavesbg.jpg')" }}
        />
        <div className="absolute inset-0 bg-forge-black/60" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass-modal p-4 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Progress bar */}
        <div className="flex gap-1 mb-4 sm:mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= step ? 'bg-ember' : 'bg-iron-slate/50'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center gap-2 text-fog hover:text-bone transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === totalSteps - 1 ? (
              <>
                <Sparkles className="w-4 h-4" />
                Start Your Voyage
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
