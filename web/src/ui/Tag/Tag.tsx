import * as React from 'react'
import { cx } from '../cx'
import './Tag.scss'

export function Tag({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'primary' | 'secondary' | 'ok' | 'warn' | 'danger'
  children: React.ReactNode
}) {
  return <span className={cx('sw-tag-tag', `sw-tag-${tone}`)}>{children}</span>
}
