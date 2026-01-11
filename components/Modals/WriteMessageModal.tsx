'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, X } from 'lucide-react'
import type { Message } from '../../lib/types'

interface WriteMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (message: Omit<Message, 'id' | 'read'>) => void
}

export function WriteMessageModal({
  isOpen,
  onClose,
  onSubmit
}: WriteMessageModalProps) {
  const [content, setContent] = useState('')
  const [deliverIn, setDeliverIn] = useState('7') // days
  const [mood, setMood] = useState<Message['mood']>('hopeful')

  const moods: { value: Message['mood']; label: string; emoji: string }[] = [
    { value: 'hopeful', label: 'Hopeful', emoji: '🌅' },
    { value: 'grateful', label: 'Grateful', emoji: '🙏' },
    { value: 'determined', label: 'Determined', emoji: '⚔️' },
    { value: 'reflective', label: 'Reflective', emoji: '🌊' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      const deliverDate = new Date()
      deliverDate.setDate(deliverDate.getDate() + parseInt(deliverIn))
      onSubmit({
        content: content.trim(),
        created_at: new Date().toISOString(),
        deliver_at: deliverDate.toISOString().split('T')[0]!,
        mood,
      })
      setContent('')
      setDeliverIn('7')
      setMood('hopeful')
      onClose()
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
            className="glass-modal p-5 sm:p-8 w-full max-w-lg mx-2 sm:mx-0 relative z-10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-fjord/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-fjord" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Message in a Bottle</h2>
                  <p className="text-fog text-sm">Write to your future self</p>
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
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Dear future me..."
                className="input w-full h-32 resize-none mb-4"
                autoFocus
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="stat-label block mb-2">Deliver in</label>
                  <select
                    value={deliverIn}
                    onChange={(e) => setDeliverIn(e.target.value)}
                    className="input w-full"
                  >
                    <option value="1">Tomorrow</option>
                    <option value="7">1 week</option>
                    <option value="14">2 weeks</option>
                    <option value="30">1 month</option>
                    <option value="90">3 months</option>
                    <option value="180">6 months</option>
                    <option value="365">1 year</option>
                  </select>
                </div>
                <div>
                  <label className="stat-label block mb-2">Mood</label>
                  <div className="flex gap-2">
                    {moods.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMood(m.value)}
                        className={`flex-1 p-2 rounded-lg text-center transition-all ${
                          mood === m.value
                            ? 'bg-fjord/30 border border-fjord/50'
                            : 'glass-recessed hover:bg-iron-slate/50'
                        }`}
                        title={m.label}
                      >
                        <span className="text-lg">{m.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                Cast into the Sea
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
