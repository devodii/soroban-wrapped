import * as React from 'react'
import './Stat.scss'

export function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  accent?: string
}) {
  return (
    <div className="sw-stat-stat">
      <div className="sw-stat-label">
        {accent && <span className="sw-stat-dot" style={{ background: accent }} />}
        {label}
      </div>
      <div className="sw-stat-value">{value}</div>
      {hint && <div className="sw-stat-hint">{hint}</div>}
    </div>
  )
}
