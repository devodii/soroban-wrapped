import * as React from 'react'
import { setParams } from '../lib/url'
import { useSearch } from '../lib/queries'
import { setTheme, useTheme } from '../lib/theme'
import { CommandPalette, type PaletteCommand } from '../ui/CommandPalette/CommandPalette'
import { SECTIONS } from '../sections/Nav/Nav'

export function CommandCenter({
  open,
  onOpen,
  onClose,
}: {
  open: boolean
  onOpen: () => void
  onClose: () => void
}) {
  const [query, setQuery] = React.useState('')
  const theme = useTheme()
  const search = useSearch(query.trim())

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onOpen])

  const base: PaletteCommand[] = [
    ...SECTIONS.map((s) => ({
      id: `go:${s.id}`,
      group: 'Jump to',
      label: s.label,
      run: () => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }),
    })),
    {
      id: 'theme',
      group: 'Settings',
      label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`,
      run: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
  ]

  const hits: PaletteCommand[] = (search.data?.hits ?? []).flatMap((hit) => {
    const id = `${hit.kind}:${hit.id}`
    const make = (patch: Record<string, string>) => ({
      id,
      group: hit.kind,
      label: hit.label,
      hint: hit.sub,
      run: () => setParams(patch),
    })
    switch (hit.kind) {
      case 'proposal':
        return [make({ proposal: hit.id })]
      case 'need':
        return [make({ need: hit.id })]
      case 'pattern':
        return [make({ pattern: hit.id })]
      case 'repo':
        return [make({ repo: hit.id })]
      case 'contract':
        return [make({ contract: hit.id })]
      default:
        return []
    }
  })

  const needle = query.trim().toLowerCase()
  const commands = needle
    ? [...hits, ...base.filter((c) => c.label.toLowerCase().includes(needle))]
    : base

  return (
    <CommandPalette
      open={open}
      onClose={onClose}
      query={query}
      onQuery={setQuery}
      commands={commands}
      busy={search.isFetching}
    />
  )
}
