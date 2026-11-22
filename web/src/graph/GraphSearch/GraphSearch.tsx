import * as React from 'react'
import { Search } from 'lucide-react'
import { useSearch } from '../../lib/queries'
import { KindIcon } from '../KindIcon/KindIcon'
import type { GraphNode } from '../model'
import './GraphSearch.scss'

const LOCAL_LIMIT = 6

function nodeIdFor(kind: string, id: string): string | null {
  if (kind === 'proposal' || kind === 'repo') return `${kind}:${id}`
  if (kind === 'contract') return `contract:${id.replace('/', ':')}`
  return null
}

export function GraphSearch({
  nodes,
  onPick,
}: {
  nodes: GraphNode[]
  onPick: (id: string) => void
}) {
  const [text, setText] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const query = text.trim().toLowerCase()
  const remote = useSearch(query.length >= 3 ? query : '')

  const local = React.useMemo(
    () =>
      query.length < 2
        ? []
        : nodes
            .filter((n) => n.label.toLowerCase().includes(query))
            .sort((a, b) => b.weight - a.weight)
            .slice(0, LOCAL_LIMIT),
    [nodes, query],
  )
  const loaded = new Set(local.map((n) => n.id))
  const more = (remote.data?.hits ?? [])
    .map((hit) => ({ hit, id: nodeIdFor(hit.kind, hit.id) }))
    .filter((x): x is { hit: typeof x.hit; id: string } => !!x.id && !loaded.has(x.id))
    .slice(0, LOCAL_LIMIT)

  const choose = (id: string) => {
    onPick(id)
    setText('')
    setOpen(false)
  }

  return (
    <div className="sw-graphsearch">
      <label className="sw-graphsearch-field">
        <Search size={14} />
        <input
          value={text}
          placeholder="Find a node and fly to it"
          aria-label="Find a node"
          onChange={(event) => {
            setText(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={(event) => {
            const first = local[0]?.id ?? more[0]?.id
            if (event.key === 'Enter' && first) choose(first)
          }}
        />
      </label>
      {open && (local.length > 0 || more.length > 0) && (
        <ul className="sw-graphsearch-list">
          {local.map((n) => (
            <li key={n.id}>
              <button type="button" onMouseDown={() => choose(n.id)}>
                <KindIcon kind={n.kind} />
                <span>{n.label}</span>
              </button>
            </li>
          ))}
          {more.map(({ hit, id }) => (
            <li key={id}>
              <button type="button" onMouseDown={() => choose(id)}>
                <KindIcon
                  kind={
                    hit.kind === 'repo' ? 'repo' : hit.kind === 'proposal' ? 'proposal' : 'contract'
                  }
                />
                <span>{hit.label}</span>
                <small>not in view</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
