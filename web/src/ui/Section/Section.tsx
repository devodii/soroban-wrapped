import * as React from 'react'
import './Section.scss'

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="sw-section">
      <h3 className="sw-section-title">{title}</h3>
      {children}
    </section>
  )
}
