import { ExternalLink, Network, Target, X } from 'lucide-react'
import moment from 'moment'
import { Button } from '../../ui/Button/Button'
import { Tag } from '../../ui/Tag/Tag'
import { KindIcon } from '../KindIcon/KindIcon'
import { KIND_BLURB, KIND_LABEL, NETWORK_LABEL, type GraphNode } from '../model'
import './NodeCard.scss'

export function NodeCard({
  node,
  neighbours,
  busy,
  onClose,
  onOpen,
  onExpand,
  onFocus,
  onPick,
}: {
  node: GraphNode
  neighbours: GraphNode[]
  busy: boolean
  onClose: () => void
  onOpen: () => void
  onExpand: () => void
  onFocus: () => void
  onPick: (id: string) => void
}) {
  const openable = node.kind === 'proposal' || node.kind === 'repo' || node.kind === 'contract'
  return (
    <aside className="sw-nodecard" aria-label="Selected node">
      <header className="sw-nodecard-header">
        <KindIcon kind={node.kind} size={18} />
        <div>
          <div className="sw-nodecard-kind">{KIND_LABEL[node.kind]}</div>
          <h4>{node.label}</h4>
        </div>
        <Button variant="ghost" size="icon" aria-label="Clear selection" onClick={onClose}>
          <X size={16} />
        </Button>
      </header>
      <p className="sw-nodecard-blurb">{KIND_BLURB[node.kind]}</p>
      <div className="sw-nodecard-tags">
        {node.network && (
          <Tag tone={node.network === 'testnet' ? 'secondary' : 'primary'}>
            {NETWORK_LABEL[node.network]}
          </Tag>
        )}
        {node.status && <Tag>{node.status}</Tag>}
        {node.origin && <Tag>{node.origin}</Tag>}
        {node.live === true && <Tag tone="ok">live</Tag>}
        {node.language && <Tag>{node.language}</Tag>}
        {node.stars != null && <Tag>{node.stars.toLocaleString('en')} stars</Tag>}
        {node.pushed_at && <Tag>pushed {moment(node.pushed_at).fromNow()}</Tag>}
        <Tag>{node.degree.toLocaleString('en')} links</Tag>
      </div>
      <div className="sw-nodecard-actions">
        {openable && (
          <Button variant="primary" size="sm" onClick={onOpen}>
            <ExternalLink size={14} />
            Open details
          </Button>
        )}
        <Button size="sm" onClick={onExpand} disabled={busy}>
          <Network size={14} />
          {busy ? 'Loading' : 'Expand neighbours'}
        </Button>
        <Button size="sm" onClick={onFocus}>
          <Target size={14} />
          Focus here
        </Button>
      </div>
      {neighbours.length > 0 && (
        <ul className="sw-nodecard-neighbours" aria-label="Connected nodes">
          {neighbours.map((n) => (
            <li key={n.id}>
              <button type="button" onClick={() => onPick(n.id)}>
                <KindIcon kind={n.kind} />
                <span>{n.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
