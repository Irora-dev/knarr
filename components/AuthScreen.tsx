'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, Anchor, AlertCircle } from 'lucide-react'
import { useAuth } from '../lib/auth'

export function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsSubmitting(false)
      return
    }

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else {
          setShowConfirmation(true)
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        }
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/wavesbg.jpg')" }}
          />
          <div className="absolute inset-0 bg-forge-black/60" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 glass-modal p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-victory-green/20 flex items-center justify-center">
            <Mail className="w-8 h-8 text-victory-green" />
          </div>
          <h2 className="font-display text-2xl text-bone mb-3">Check Your Email</h2>
          <p className="text-fog mb-6">
            We've sent a confirmation link to <span className="text-bone">{email}</span>.
            Click the link to activate your account and start your voyage.
          </p>
          <button
            onClick={() => {
              setShowConfirmation(false)
              setMode('signin')
            }}
            className="text-ember hover:text-ember/80 transition-colors"
          >
            Back to Sign In
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/wavesbg.jpg')" }}
        />
        <div className="absolute inset-0 bg-forge-black/50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass-modal p-8 max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/iconmain.png" alt="Knarr" className="h-12 w-auto" />
            <h1 className="font-display text-3xl text-bone font-bold tracking-wide">Knarr</h1>
          </div>
          <p className="text-fog text-sm">The command centre for life</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-iron-slate/30 rounded-lg">
          <button
            onClick={() => { setMode('signin'); setError(null) }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === 'signin'
                ? 'bg-ember text-forge-black'
                : 'text-fog hover:text-bone'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null) }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === 'signup'
                ? 'bg-ember text-forge-black'
                : 'text-fog hover:text-bone'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-lg bg-blood-red/20 border border-blood-red/30 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-blood-red shrink-0 mt-0.5" />
              <p className="text-sm text-bone">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-stone uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="captain@knarr.app"
                className="input pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-stone uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your secret passage"
                className="input pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-xs text-stone uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your passage"
                    className="input pl-10"
                    required={mode === 'signup'}
                    minLength={6}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Anchor className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                {mode === 'signin' ? 'Set Sail' : 'Begin Voyage'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-stone text-xs mt-6">
          {mode === 'signin' ? (
            <>
              New to Knarr?{' '}
              <button
                onClick={() => { setMode('signup'); setError(null) }}
                className="text-ember hover:text-ember/80 transition-colors"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setError(null) }}
                className="text-ember hover:text-ember/80 transition-colors"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  )
}
