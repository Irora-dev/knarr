'use client'

import { motion } from 'framer-motion'

export function DirectionCard({
  title,
  icon: Icon,
  children,
  delay = 0
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      className="direction-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-ember" />
          </div>
          <h3 className="font-display text-lg text-bone font-semibold tracking-wide">{title}</h3>
        </div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
