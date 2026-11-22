import * as React from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { cx } from '../cx'
import './Figure.scss'

const DURATION_S = 1.6

export function Figure({
  value,
  format = (n: number) => Math.round(n).toLocaleString('en'),
  className,
}: {
  value: number
  format?: (value: number) => string
  className?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const still = useReducedMotion()
  const [shown, setShown] = React.useState(0)

  React.useEffect(() => {
    if (!inView || still) return
    const controls = animate(0, value, {
      duration: DURATION_S,
      ease: [0.22, 0.8, 0.28, 1],
      onUpdate: setShown,
    })
    return controls.stop
  }, [inView, value, still])

  return (
    <span ref={ref} className={cx('sw-figure', className)}>
      <span className="sw-figure-ghost">{format(value)}</span>
      <span aria-hidden className="sw-figure-live">
        {format(still ? value : shown)}
      </span>
    </span>
  )
}
