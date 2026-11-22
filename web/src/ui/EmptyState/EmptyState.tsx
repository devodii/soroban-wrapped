import * as React from 'react'
import { Inbox } from 'lucide-react'
import './EmptyState.scss'

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="sw-emptystate-state">
      <Inbox size={28} />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}
