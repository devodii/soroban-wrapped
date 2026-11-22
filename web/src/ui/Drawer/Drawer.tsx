import * as React from 'react'
import { Drawer as Base } from '@base-ui/react/drawer'
import { X } from 'lucide-react'
import './Drawer.scss'

export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  eyebrow?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Base.Root open={open} onOpenChange={(next) => !next && onClose()} swipeDirection="right">
      <Base.Portal>
        <Base.Backdrop className="sw-drawer-scrim" />
        <Base.Viewport className="sw-drawer-viewport">
          <Base.Popup className="sw-drawer-popup">
            <header className="sw-drawer-header">
              <div className="sw-drawer-heading">
                {eyebrow && <div className="sw-drawer-eyebrow">{eyebrow}</div>}
                <Base.Title render={<h2 />}>{title}</Base.Title>
              </div>
              <Base.Close className="sw-drawer-close" aria-label="Close">
                <X size={18} />
              </Base.Close>
            </header>
            <Base.Content className="sw-drawer-body">{children}</Base.Content>
            {footer && <footer className="sw-drawer-footer">{footer}</footer>}
          </Base.Popup>
        </Base.Viewport>
      </Base.Portal>
    </Base.Root>
  )
}
