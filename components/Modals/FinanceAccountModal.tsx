'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, X, Trash2 } from 'lucide-react'
import { ACCOUNT_TYPES } from '../../constants/categories'
import type { FinanceAccount } from '../../lib/types'

interface FinanceAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (account: Omit<FinanceAccount, 'id' | 'created_at'>) => void
  existingAccount?: FinanceAccount | null
  onDelete?: () => void
}

export function FinanceAccountModal({
  isOpen,
  onClose,
  onSubmit,
  existingAccount,
  onDelete,
}: FinanceAccountModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<FinanceAccount['type']>('checking')
  const [balance, setBalance] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [institution, setInstitution] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isOpen && existingAccount) {
      setName(existingAccount.name)
      setType(existingAccount.type)
      setBalance(existingAccount.balance.toString())
      setCurrency(existingAccount.currency)
      setInstitution(existingAccount.institution || '')
      setNotes(existingAccount.notes || '')
    } else if (isOpen) {
      setName('')
      setType('checking')
      setBalance('')
      setCurrency('USD')
      setInstitution('')
      setNotes('')
    }
  }, [isOpen, existingAccount])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !balance) return

    const accountType = ACCOUNT_TYPES.find(t => t.value === type)

    onSubmit({
      name: name.trim(),
      type,
      balance: parseFloat(balance),
      currency,
      institution: institution.trim() || undefined,
      notes: notes.trim() || undefined,
      is_asset: accountType?.is_asset ?? true,
      last_updated: new Date().toISOString(),
    })
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
            className="glass-modal p-5 sm:p-8 w-full max-w-md mx-2 sm:mx-0 relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
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
                  <h2 className="font-display text-xl font-semibold">
                    {existingAccount ? 'Edit Account' : 'Add Account'}
                  </h2>
                  <p className="text-fog text-sm">Track your assets & liabilities</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Main Checking"
                    className="input w-full"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                    Account Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ACCOUNT_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value as FinanceAccount['type'])}
                        className={`p-2 rounded-lg text-xs font-medium transition-all ${
                          type === t.value
                            ? t.is_asset
                              ? 'bg-victory-green/20 text-victory-green border border-victory-green/30'
                              : 'bg-blood-red/20 text-blood-red border border-blood-red/30'
                            : 'glass-recessed text-fog hover:text-bone'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                      Balance
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      placeholder="0.00"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="input w-full"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                    Institution (optional)
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Chase Bank"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone uppercase tracking-wider mb-2 block">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes..."
                    className="input w-full resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full mt-6">
                {existingAccount ? 'Update Account' : 'Add Account'}
              </button>

              {existingAccount && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="w-full mt-3 py-2 text-blood-red hover:text-blood-red/80 text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
