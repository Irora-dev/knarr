'use client'

import { motion } from 'framer-motion'
import type { Message } from '../../lib/types'

interface MessageCardProps {
  message: Message
  onMarkRead: (id: string) => void
}

export function MessageCard({ message, onMarkRead }: MessageCardProps) {
  const moodEmojis: Record<string, string> = {
    hopeful: '🌅',
    grateful: '🙏',
    determined: '⚔️',
    reflective: '🌊',
  }

  const createdDate = new Date(message.created_at)
  const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <motion.div
      className={`glass-recessed p-4 rounded-lg ${!message.read ? 'border border-fjord/30' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{message.mood ? moodEmojis[message.mood] : '📜'}</span>
          <span className="text-caption text-stone">
            {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
          </span>
        </div>
        {!message.read && (
          <span className="text-xs bg-fjord/30 text-fjord px-2 py-0.5 rounded-full">New</span>
        )}
      </div>
      <p className="text-fog text-sm leading-relaxed mb-3">{message.content}</p>
      {!message.read && (
        <button
          onClick={() => onMarkRead(message.id)}
          className="text-xs text-fjord hover:text-bone transition-colors"
        >
          Mark as read
        </button>
      )}
    </motion.div>
  )
}
