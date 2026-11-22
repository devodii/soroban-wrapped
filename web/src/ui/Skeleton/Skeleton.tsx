import { cx } from '../cx'
import './Skeleton.scss'

export function Skeleton({
  width,
  height,
  className,
}: {
  width?: string
  height?: string
  className?: string
}) {
  return (
    <span className={cx('sw-skeleton-skeleton', className)} style={{ width, height }} aria-hidden />
  )
}
