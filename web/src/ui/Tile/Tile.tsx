import * as React from 'react'
import { cx } from '../cx'
import './Tile.scss'

export function Tile({
  title,
  note,
  className,
  children,
}: {
  title: string
  note?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cx('sw-tile', className)}>
      <header className="sw-tile-header">
        <h3 className="sw-tile-title">{title}</h3>
        {note && <span className="sw-tile-note">{note}</span>}
      </header>
      {children}
    </section>
  )
}
