import './Backdrop.scss'

export function Backdrop() {
  return (
    <div aria-hidden className="sw-backdrop">
      <div className="sw-backdrop-glow sw-backdrop-secondary" />
      <div className="sw-backdrop-glow sw-backdrop-primary" />
      <div className="sw-backdrop-dots" />
    </div>
  )
}
