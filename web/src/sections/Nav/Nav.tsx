import * as React from 'react'
import { Command, Moon, Sun } from 'lucide-react'
import { setTheme, useTheme } from '../../lib/theme'
import { Button } from '../../ui/Button/Button'
import { cx } from '../../ui/cx'
import './Nav.scss'

export const SECTIONS = [
  { id: 'hand-written', label: 'Hand written' },
  { id: 'needs', label: 'Tooling gaps' },
  { id: 'chain', label: 'On chain' },
  { id: 'graph', label: 'The graph' },
]

export function Nav({ onPalette }: { onPalette: () => void }) {
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
        <Button size="sm" onClick={onPalette} aria-label="Open the command palette">
          <Command size={14} />
          <span className="sw-nav-key">K</span>
        </Button>
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
