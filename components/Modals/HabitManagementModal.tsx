'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, X, Plus } from 'lucide-react'
import type { Habit } from '../../lib/types'

interface HabitManagementModalProps {
  isOpen: boolean
  onClose: () => void
  habits: Habit[]
  onAdd: (name: string) => void
  onEdit: (id: string, name: string) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string) => void
}

export function HabitManagementModal({
  isOpen,
  onClose,
  habits,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive
}: HabitManagementModalProps) {
  const [newHabitName, setNewHabitName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleAdd = () => {
    if (newHabitName.trim()) {
      onAdd(newHabitName.trim())
      setNewHabitName('')
    }
  }

  const startEditing = (habit: Habit) => {
    setEditingId(habit.id)
    setEditingName(habit.name)
  }

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      onEdit(editingId, editingName.trim())
      setEditingId(null)
      setEditingName('')
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
            className="glass-modal p-8 w-full max-w-md relative z-10 max-h-[80vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-victory-green/20 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-victory-green" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Manage Habits</h2>
                  <p className="text-fog text-sm">Add, edit, or remove habits</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-iron-slate/50 flex items-center justify-center text-fog hover:text-bone hover:bg-iron-slate transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add new habit */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="New habit name..."
                className="input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <button
                onClick={handleAdd}
                className="btn-secondary px-4"
                disabled={!newHabitName.trim()}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Habit list */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  className={`glass-recessed p-3 rounded-lg flex items-center gap-3 ${
                    !habit.active ? 'opacity-50' : ''
                  }`}
                >
                  {editingId === habit.id ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="input flex-1 py-1"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <button
                        onClick={saveEdit}
                        className="text-victory-green hover:text-bone transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-stone hover:text-bone transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onToggleActive(habit.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                          habit.active
                            ? 'bg-victory-green border-victory-green'
                            : 'border-2 border-stone'
                        }`}
                      >
                        {habit.active && (
                          <svg viewBox="0 0 24 24" className="w-3 h-3 text-forge-black">
                            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                      </button>
                      <span className="flex-1 text-fog">{habit.name}</span>
                      <button
                        onClick={() => startEditing(habit)}
                        className="text-stone hover:text-bone transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(habit.id)}
                        className="text-blood-red hover:text-bone transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
              {habits.length === 0 && (
                <div className="text-center py-8 text-stone">
                  No habits yet. Add one above!
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
