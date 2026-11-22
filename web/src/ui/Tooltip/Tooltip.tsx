import * as React from 'react'
import { Tooltip as Base } from '@base-ui/react/tooltip'
import './Tooltip.scss'

export function Tooltip({
  content,
  children,
}: {
  content: React.ReactNode
  children: React.ReactElement<Record<string, unknown>>
}) {
  return (
    <Base.Provider delay={150}>
      <Base.Root>
        <Base.Trigger render={children} />
        <Base.Portal>
          <Base.Positioner sideOffset={8} className="sw-tooltip-positioner">
            <Base.Popup className="sw-tooltip-popup">{content}</Base.Popup>
          </Base.Positioner>
        </Base.Portal>
      </Base.Root>
    </Base.Provider>
  )
}
