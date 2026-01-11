'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Pill, X, Beaker, Info, AlertTriangle, Sparkles } from 'lucide-react'
import type { SupplementItem } from '../../constants/dopamineProtocol'

interface SupplementDetailModalProps {
  isOpen: boolean
  onClose: () => void
  supplement: SupplementItem | null
  phaseColor: string
  phaseBgColor: string
}

export function SupplementDetailModal({
  isOpen,
  onClose,
  supplement,
  phaseColor,
  phaseBgColor,
}: SupplementDetailModalProps) {
  if (!supplement) return null

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
            className="glass-modal p-5 sm:p-8 w-full max-w-md mx-2 sm:mx-0 relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${phaseBgColor} flex items-center justify-center shrink-0`}>
                  <Pill className={`w-5 h-5 ${phaseColor}`} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-bone">{supplement.name}</h2>
                  <p className={`text-sm ${phaseColor}`}>{supplement.effect}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dosage Info */}
            <div className="glass-recessed rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Beaker className="w-4 h-4 text-fog" />
                <span className="text-xs text-stone uppercase tracking-wider">Dosage</span>
              </div>
              <p className="text-lg font-mono text-bone">{supplement.dosage}</p>
              {supplement.measurement && (
                <p className="text-sm text-fog mt-1">{supplement.measurement}</p>
              )}
            </div>

            {/* How It Works */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-fog" />
                <span className="text-xs text-stone uppercase tracking-wider">How It Works</span>
              </div>
              <p className="text-sm text-fog leading-relaxed">{supplement.details}</p>
            </div>

            {/* Substitute Info */}
            {supplement.substituteFor && (
              <div className="glass-recessed rounded-lg p-3 mb-4 border border-fjord/30">
                <p className="text-sm text-fjord">
                  <span className="font-medium">Substitute for:</span> {supplement.substituteFor}
                </p>
              </div>
            )}

            {/* Warning */}
            {supplement.warning && (
              <div className="rounded-lg p-3 mb-4 bg-blood-red/10 border border-blood-red/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blood-red shrink-0 mt-0.5" />
                  <p className="text-sm text-blood-red">{supplement.warning}</p>
                </div>
              </div>
            )}

            {/* Optional Badge */}
            {supplement.optional && (
              <div className="flex items-center gap-2 text-sm text-stone">
                <Sparkles className="w-4 h-4" />
                <span>This supplement is optional based on availability</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="btn-primary w-full mt-6"
            >
              Got It
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
