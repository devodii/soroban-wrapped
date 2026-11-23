import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { setTheme, useTheme } from '../../lib/theme'
import { Button } from '../../ui/Button/Button'
import { cx } from '../../ui/cx'
import { Segmented } from '../../ui/Segmented/Segmented'
import './Nav.scss'

export type NetworkName = 'mainnet' | 'testnet'

export const SECTIONS = [
  { id: 'pulse', label: 'Pulse' },
  { id: 'concentration', label: 'Concentration' },
  { id: 'leaders', label: 'Leaders' },
  { id: 'rhythm', label: 'Rhythm' },
  { id: 'graph', label: 'Graph' },
  { id: 'stack', label: 'Stack' },
]

export function Nav({
  network,
  onNetwork,
}: {
  network: NetworkName
  onNetwork: (network: NetworkName) => void
}) {
  const theme = useTheme()
  const [active, setActive] = React.useState('')

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    SECTIONS.forEach(({ id }) => {
      const node = document.getElementById(id)
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <header className="sw-nav">
      <a className="sw-nav-brand" href="#top">
        Soroban <em>Wrapped</em>
      </a>
      <nav className="sw-nav-links" aria-label="Sections">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className={cx(active === s.id && 'sw-nav-active')}>
            {s.label}
          </a>
        ))}
      </nav>
      <div className="sw-nav-actions">
        <Segmented
          label="Network"
          value={network}
          onChange={onNetwork}
          options={[
            { value: 'mainnet', label: 'Mainnet', accent: 'var(--net-mainnet)' },
            { value: 'testnet', label: 'Testnet', accent: 'var(--net-testnet)' },
          ]}
        />
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </header>
  )
}
