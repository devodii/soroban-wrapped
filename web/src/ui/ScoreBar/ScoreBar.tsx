import { cx } from '../cx'
import { Tooltip } from '../Tooltip/Tooltip'
import './ScoreBar.scss'

export function ScoreBar({
  label,
  value,
  display,
  tone = 'primary',
  explain,
  negative,
}: {
  label: string
  value: number
  display?: string
  tone?: 'primary' | 'secondary' | 'teal'
  explain?: string
  negative?: boolean
}) {
  const clamped = Math.min(Math.max(value, 0), 1)
  const row = (
    <div className="sw-scorebar-row">
      <span className="sw-scorebar-label">{label}</span>
      <span
        className="sw-scorebar-track"
        role="meter"
        aria-valuenow={Math.round(clamped * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <span
          className={cx(
            'sw-scorebar-fill',
            `sw-scorebar-${tone}`,
            negative && 'sw-scorebar-negative',
          )}
          style={{ width: `${Math.round(clamped * 100)}%` }}
        />
      </span>
      <span className="sw-scorebar-value">{display ?? `${Math.round(clamped * 100)}%`}</span>
    </div>
  )
  return explain ? <Tooltip content={explain}>{row}</Tooltip> : row
}
