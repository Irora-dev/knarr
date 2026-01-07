'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, X, Compass } from 'lucide-react'

export interface TutorialStep {
  target: string // CSS selector or element ID
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

interface TutorialProps {
  steps: TutorialStep[]
  onComplete: () => void
  onSkip: () => void
}

interface HighlightRect {
  top: number
  left: number
  width: number
  height: number
}

export function Tutorial({ steps, onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  const step = steps[currentStep]

  const updateHighlight = useCallback(() => {
    if (!step) return

    // Handle 'center' position for intro/outro steps with no target
    if (step.position === 'center' || !step.target) {
      setHighlightRect(null)
      setTooltipPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2
      })
      return
    }

    const element = document.querySelector(step.target)
    if (!element) {
      console.warn(`Tutorial: Element not found for selector "${step.target}"`)
      setHighlightRect(null)
      return
    }

    const rect = element.getBoundingClientRect()
    const padding = 8

    setHighlightRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2
    })

    // Calculate tooltip position based on step.position
    const tooltipWidth = 320
    const tooltipHeight = 180
    const margin = 16

    let top = 0
    let left = 0

    switch (step.position) {
      case 'top':
        top = rect.top - tooltipHeight - margin
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        break
      case 'bottom':
        top = rect.bottom + margin
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        break
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.left - tooltipWidth - margin
        break
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.right + margin
        break
      default:
        // Auto-position: prefer bottom, then top, then right
        if (rect.bottom + tooltipHeight + margin < window.innerHeight) {
          top = rect.bottom + margin
          left = rect.left + rect.width / 2 - tooltipWidth / 2
        } else if (rect.top - tooltipHeight - margin > 0) {
          top = rect.top - tooltipHeight - margin
          left = rect.left + rect.width / 2 - tooltipWidth / 2
        } else {
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.right + margin
        }
    }

    // Keep tooltip within viewport
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin))
    top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin))

    setTooltipPosition({ top, left })
  }, [step])

  useEffect(() => {
    updateHighlight()

    // Update on resize and scroll
    window.addEventListener('resize', updateHighlight)
    window.addEventListener('scroll', updateHighlight, true)

    return () => {
      window.removeEventListener('resize', updateHighlight)
      window.removeEventListener('scroll', updateHighlight, true)
    }
  }, [updateHighlight])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0
  const isCenterStep = step?.position === 'center' || !step?.target

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with spotlight cutout */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <mask id="spotlight-mask">
            {/* White = visible, black = hidden */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left}
                y={highlightRect.top}
                width={highlightRect.width}
                height={highlightRect.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(13, 13, 15, 0.85)"
          mask="url(#spotlight-mask)"
          style={{ backdropFilter: 'blur(4px)' }}
        />
      </svg>

      {/* Highlight border glow */}
      {highlightRect && (
        <motion.div
          className="absolute rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            top: highlightRect.top,
            left: highlightRect.left,
            width: highlightRect.width,
            height: highlightRect.height,
            boxShadow: '0 0 0 2px rgba(201, 162, 39, 0.6), 0 0 20px rgba(201, 162, 39, 0.3)',
          }}
        />
      )}

      {/* Click blocker for non-highlighted areas */}
      <div
        className="absolute inset-0"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`absolute z-[101] w-80 ${isCenterStep ? '-translate-x-1/2 -translate-y-1/2' : ''}`}
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            pointerEvents: 'auto'
          }}
        >
          <div className="glass-modal p-5 rounded-xl shadow-2xl">
            {/* Header with step counter and skip */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-ember" />
                <span className="text-xs text-stone">
                  {currentStep + 1} of {steps.length}
                </span>
              </div>
              <button
                onClick={onSkip}
                className="text-stone hover:text-fog transition-colors p-1"
                aria-label="Skip tutorial"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1 mb-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i <= currentStep ? 'bg-ember' : 'bg-iron-slate/50'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <h3 className="font-display text-lg text-bone mb-2">{step?.title}</h3>
            <p className="text-fog text-sm leading-relaxed mb-5">{step?.description}</p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={isFirstStep}
                className="flex items-center gap-1 text-sm text-fog hover:text-bone transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleNext}
                className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
              >
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
