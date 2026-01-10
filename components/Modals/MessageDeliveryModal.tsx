'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mail } from 'lucide-react'
import type { Message } from '../../lib/types'

interface MessageDeliveryModalProps {
  isOpen: boolean
  message: Message | null
  onClose: () => void
  onMarkRead: (id: string) => void
  unreadCount: number
}

export function MessageDeliveryModal({
  isOpen,
  message,
  onClose,
  onMarkRead,
  unreadCount
}: MessageDeliveryModalProps) {
  if (!message) return null

  const moodEmojis: Record<string, string> = {
    hopeful: '🌅',
    grateful: '🙏',
    determined: '⚔️',
    reflective: '🌊',
  }

  const moodLabels: Record<string, string> = {
    hopeful: 'Hopeful',
    grateful: 'Grateful',
    determined: 'Determined',
    reflective: 'Reflective',
  }

  const createdDate = new Date(message.created_at)
  const deliveredDate = new Date(message.deliver_at)
  const daysInTransit = Math.floor((deliveredDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

  const handleClose = () => {
    onMarkRead(message.id)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-forge-black/80 backdrop-blur-md"
            onClick={handleClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          >
            {/* Floating bottle animation */}
            <motion.div
              className="flex justify-center mb-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fjord/30 to-fjord/10 flex items-center justify-center border border-fjord/30 shadow-lg shadow-fjord/20">
                <Mail className="w-10 h-10 text-fjord" />
              </div>
            </motion.div>

            <div className="glass-modal p-6 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">{message.mood ? moodEmojis[message.mood] : '📜'}</span>
                <h2 className="font-display text-xl text-bone">Message Arrived</h2>
              </div>

              <p className="text-sm text-stone mb-4">
                Sent {daysInTransit} {daysInTransit === 1 ? 'day' : 'days'} ago
                {message.mood && ` • Feeling ${moodLabels[message.mood]?.toLowerCase()}`}
              </p>

              <div className="glass-recessed p-4 rounded-lg mb-4 text-left">
                <p className="text-fog leading-relaxed italic">"{message.content}"</p>
              </div>

              <p className="text-xs text-stone mb-4">— You, from the past</p>

              <button
                onClick={handleClose}
                className="btn-primary w-full"
              >
                {unreadCount > 1 ? `Continue (${unreadCount - 1} more)` : 'Close'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
