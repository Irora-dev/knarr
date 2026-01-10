'use client'

import { motion } from 'framer-motion'

export function ModeToggle({ mode, onToggle }: { mode: 'view' | 'log'; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-recessed hover:bg-white/5 transition-all"
    >
      <div className="flex items-center gap-1 text-xs">
        <span className={mode === 'view' ? 'text-ember font-medium' : 'text-stone'}>View</span>
        <div className="relative w-10 h-5 rounded-full bg-iron-slate/50 border border-white/10">
          <motion.div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-ember"
            animate={{ left: mode === 'view' ? '2px' : '22px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
        <span className={mode === 'log' ? 'text-ember font-medium' : 'text-stone'}>Log</span>
      </div>
    </button>
  )
}
