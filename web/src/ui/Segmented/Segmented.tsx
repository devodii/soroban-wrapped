import { cx } from '../cx'
import './Segmented.scss'

export interface Option<T extends string> {
  value: T
  label: string
  accent?: string
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div className="sw-segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={cx('sw-segmented-option', option.value === value && 'sw-segmented-on')}
          onClick={() => onChange(option.value)}
        >
          {option.accent && (
            <span className="sw-segmented-dot" style={{ background: option.accent }} />
          )}
          {option.label}
        </button>
      ))}
    </div>
  )
}
