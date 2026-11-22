import * as React from 'react'
import { cx } from '../cx'
import './Card.scss'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'plain' | 'glass' | 'accent'
}

export function Card({ tone = 'plain', className, ...props }: Props) {
  return <div {...props} className={cx('sw-card-card', `sw-card-${tone}`, className)} />
}
