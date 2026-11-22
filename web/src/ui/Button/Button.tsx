import * as React from 'react'
import { cx } from '../cx'
import './Button.scss'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'icon'

interface Look {
  variant?: Variant
  size?: Size
  className?: string
}

export function Button({
  variant = 'outline',
  size = 'md',
  className,
  ...props
}: Look & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cx('sw-button-button', `sw-button-${variant}`, `sw-button-${size}`, className)}
    />
  )
}
