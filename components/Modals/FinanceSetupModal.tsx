'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, X } from 'lucide-react'

interface FinanceSetupModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (key: string) => void
}

export function FinanceSetupModal({
  isOpen,
  onClose,
  onSubmit,
}: FinanceSetupModalProps) {
  const [key, setKey] = useState('')
  const [confirmKey, setConfirmKey] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setKey('')
      setConfirmKey('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (key.length < 8) {
      setError('PIN must be at least 8 characters')
      return
    }
    if (key !== confirmKey) {
      setError('PINs do not match')
      return
    }
    onSubmit(key)
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
                <div className="w-10 h-10 rounded-lg bg-victory-green/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-victory-green" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Finance Setup</h2>
                  <p className="text-fog text-sm">Create your encryption PIN</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="glass-recessed rounded-lg p-4 mb-4">
              <p className="text-sm text-fog">
                Your financial data is encrypted with a PIN that only you know.
                This PIN never leaves your device - if you forget it, your data cannot be recovered.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                    Create PIN (8+ characters)
                  </label>
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter your PIN"
                    className="input w-full"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    value={confirmKey}
                    onChange={(e) => setConfirmKey(e.target.value)}
                    placeholder="Confirm your PIN"
                    className="input w-full"
                  />
                </div>
              </div>

              {error && (
                <p className="text-blood-red text-sm mt-3">{error}</p>
              )}

              <button type="submit" className="btn-primary w-full mt-6">
                Enable Finance Tracking
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
