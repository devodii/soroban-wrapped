import * as React from 'react'
import './SectionHeader.scss'

export function SectionHeader({
  index,
  title,
  children,
}: {
  index: string
  title: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <header className="sw-sectionheader">
      <span className="sw-sectionheader-index">{index}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </header>
  )
}
