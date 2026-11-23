import * as React from 'react'
import { cx } from '../cx'
import './Bars.scss'

export interface BarRow {
  id: string
  label: React.ReactNode
  value: number
  hint?: React.ReactNode
}

export function Bars({
  rows,
  format = (n: number) => n.toLocaleString('en'),
  tone = 'primary',
}: {
  rows: BarRow[]
  format?: (value: number) => string
  tone?: 'primary' | 'secondary' | 'teal'
}) {
  const max = Math.max(...rows.map((row) => row.value), 1)
  return (
    <ol className="sw-bars">
      {rows.map((row, index) => (
        <li key={row.id} className="sw-bars-row">
          <div className="sw-bars-head">
            <span className="sw-bars-label">{row.label}</span>
            <span className="sw-bars-value">{format(row.value)}</span>
          </div>
          <div className="sw-bars-track">
            <div
              className={cx('sw-bars-fill', `sw-bars-${index === 0 ? 'primary' : tone}`)}
              style={{ width: `${(100 * row.value) / max}%` }}
            />
          </div>
          {row.hint && <div className="sw-bars-hint">{row.hint}</div>}
        </li>
      ))}
    </ol>
  )
}
