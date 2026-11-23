import { cx } from '../../ui/cx'
import './HBars.scss'

export interface HBar {
  id: string
  label: string
  value: number
  href?: string | null
  mono?: boolean
  note?: string | null
}

export function HBars({
  rows,
  color = 'var(--chart-3)',
  format = (n: number) => n.toLocaleString('en', { notation: 'compact', maximumFractionDigits: 1 }),
  label,
}: {
  rows: HBar[]
  color?: string
  format?: (value: number) => string
  label: string
}) {
  const max = Math.max(...rows.map((row) => row.value), 1)
  return (
    <ol className="sw-hbars" aria-label={label}>
      {rows.map((row, index) => (
        <li key={row.id} className="sw-hbars-row">
          <div className="sw-hbars-head">
            {row.href ? (
              <a
                className={cx('sw-hbars-label', row.mono && 'sw-hbars-mono')}
                href={row.href}
                target="_blank"
                rel="noreferrer"
              >
                {row.label}
              </a>
            ) : (
              <span className={cx('sw-hbars-label', row.mono && 'sw-hbars-mono')}>{row.label}</span>
            )}
            {row.note && <span className="sw-hbars-note">{row.note}</span>}
          </div>
          <div className="sw-hbars-line">
            <div className="sw-hbars-track">
              <div
                className="sw-hbars-fill"
                style={{
                  width: `${(100 * row.value) / max}%`,
                  background: index === 0 ? 'var(--primary)' : color,
                }}
              />
            </div>
            <span className="sw-hbars-value">{format(row.value)}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
