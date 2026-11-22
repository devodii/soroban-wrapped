import * as React from 'react'
import { Tabs as Base } from '@base-ui/react/tabs'
import './Tabs.scss'

export function Tabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { value: T; label: React.ReactNode }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <Base.Root value={value} onValueChange={(next) => onChange(next as T)}>
      <Base.List className="sw-tabs-list">
        {items.map((item) => (
          <Base.Tab key={item.value} value={item.value} className="sw-tabs-tab">
            {item.label}
          </Base.Tab>
        ))}
        <Base.Indicator className="sw-tabs-indicator" />
      </Base.List>
    </Base.Root>
  )
}
