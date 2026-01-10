'use client'

export function StreakDisplay({ count, label }: { count: number; label: string }) {
  const marks = Array.from({ length: Math.min(count, 14) }, (_, i) => i)

  return (
    <div className="streak-container">
      <div className="streak-marks">
        {marks.map((_, i) => (
          <div
            key={i}
            className={`streak-mark ${i === marks.length - 1 ? 'current' : 'complete'}`}
          />
        ))}
      </div>
      {count > 14 && (
        <span className="text-caption text-fog">+{count - 14}</span>
      )}
      <span className="text-caption text-fog">{label}</span>
    </div>
  )
}
