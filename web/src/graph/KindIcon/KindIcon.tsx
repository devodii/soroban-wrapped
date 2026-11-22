import { SVG_SHAPE } from '../shapes'
import type { Kind } from '../model'
import { KIND_COLOR } from '../model'

export function KindIcon({
  kind,
  size = 14,
  color,
}: {
  kind: Kind
  size?: number
  color?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d={SVG_SHAPE[kind]} fill={color ?? `var(--${KIND_COLOR[kind]})`} />
    </svg>
  )
}
