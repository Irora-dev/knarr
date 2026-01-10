'use client'

export function CompassRose({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle */}
      <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />

      {/* Cardinal directions - main points */}
      <path d="M100 5 L108 100 L100 85 L92 100 Z" fill="currentColor" opacity="0.6" /> {/* N */}
      <path d="M195 100 L100 108 L115 100 L100 92 Z" fill="currentColor" opacity="0.4" /> {/* E */}
      <path d="M100 195 L92 100 L100 115 L108 100 Z" fill="currentColor" opacity="0.4" /> {/* S */}
      <path d="M5 100 L100 92 L85 100 L100 108 Z" fill="currentColor" opacity="0.4" /> {/* W */}

      {/* Intercardinal directions */}
      <path d="M165 35 L108 92 L100 100 L92 92 Z" fill="currentColor" opacity="0.2" /> {/* NE */}
      <path d="M165 165 L108 108 L100 100 L108 92 Z" fill="currentColor" opacity="0.2" /> {/* SE */}
      <path d="M35 165 L92 108 L100 100 L108 108 Z" fill="currentColor" opacity="0.2" /> {/* SW */}
      <path d="M35 35 L92 92 L100 100 L92 108 Z" fill="currentColor" opacity="0.2" /> {/* NW */}

      {/* Center circle */}
      <circle cx="100" cy="100" r="8" fill="currentColor" opacity="0.3" />
      <circle cx="100" cy="100" r="4" fill="currentColor" opacity="0.5" />
    </svg>
  )
}
