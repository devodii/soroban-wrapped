import * as React from 'react'
import { cx } from '../cx'
import './Chip.scss'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  dot?: string
  count?: number | string
}

export function Chip({ active, dot, count, className, children, ...props }: Props) {
  return (
    <button
      type="button"
      aria-pressed={active}
      {...props}
      className={cx('sw-chip-chip', active && 'sw-chip-active', className)}
    >
      {dot && <span className="sw-chip-dot" style={{ background: dot }} />}
      {children}
      {count !== undefined && <span className="sw-chip-count">{count}</span>}
    </button>
  )
}
