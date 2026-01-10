'use client'

export function NotificationDot({ className = '' }: { className?: string }) {
  return (
    <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-ember rounded-full animate-pulse ${className}`} />
  )
}
