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
  Sparkles
} from 'lucide-react'

interface OnboardingData {
  name: string
  focusAreas: string[]
  weightGoal: number | null
  currentWeight: number | null
  calorieGoal: number | null
  initialHabits: string[]
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

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    name: '',
    focusAreas: [],
    weightGoal: null,
    currentWeight: null,
    calorieGoal: null,
    initialHabits: [],
  })
  const [customHabit, setCustomHabit] = useState('')

  const totalSteps = 5

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
      case 3: return true // Calories is optional
      case 4: return true // Habits are optional
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
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-ember/20 flex items-center justify-center">
                <Compass className="w-10 h-10 text-ember" />
              </div>
              <h2 className="font-display text-2xl text-bone mb-2">Welcome to Knarr</h2>
              <p className="text-fog">Your personal command centre for life. Let's set you up.</p>
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
              <h2 className="font-display text-2xl text-bone mb-2">Choose Your Focus</h2>
              <p className="text-fog">What areas of life do you want to track?</p>
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-fjord-blue/20 flex items-center justify-center">
                <Scale className="w-8 h-8 text-fjord-blue" />
              </div>
              <h2 className="font-display text-2xl text-bone mb-2">Weight Tracking</h2>
              <p className="text-fog">Optional: Set up weight tracking goals</p>
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ember/20 flex items-center justify-center">
                <Flame className="w-8 h-8 text-ember" />
              </div>
              <h2 className="font-display text-2xl text-bone mb-2">Calorie Target</h2>
              <p className="text-fog">Optional: Set your daily calorie goal</p>
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-victory-green/20 flex items-center justify-center">
                <CheckSquare className="w-8 h-8 text-victory-green" />
              </div>
              <h2 className="font-display text-2xl text-bone mb-2">Daily Habits</h2>
              <p className="text-fog">Choose habits to track daily</p>
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
        className="relative z-10 glass-modal p-8 max-w-lg w-full"
      >
        {/* Progress bar */}
        <div className="flex gap-1 mb-8">
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
        <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
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
