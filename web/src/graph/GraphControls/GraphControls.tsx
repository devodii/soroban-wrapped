import { Maximize2 } from 'lucide-react'
import moment from 'moment'
import { Button } from '../../ui/Button/Button'
import { Chip } from '../../ui/Chip/Chip'
import { RangeSlider } from '../../ui/RangeSlider/RangeSlider'
import { Tabs } from '../../ui/Tabs/Tabs'
import { GraphSearch } from '../GraphSearch/GraphSearch'
import { KIND_COLOR, KIND_LABEL, KINDS, type GraphNode, type Kind } from '../model'
import { kindsParam, LIMITS, type GraphView, updateGraphView } from '../useGraphView'
import './GraphControls.scss'

export interface TimeWindow {
  min: number
  max: number
  from: number
  to: number
}

export function GraphControls({
  view,
  nodes,
  counts,
  time,
  onTime,
  onPick,
  onFit,
}: {
  view: GraphView
  nodes: GraphNode[]
  counts: Record<Kind, number>
  time: TimeWindow | null
  onTime: (from: number, to: number) => void
  onPick: (id: string) => void
  onFit: () => void
}) {
  const toggleKind = (kind: Kind) => {
    const next = new Set(view.kinds)
    if (next.has(kind)) next.delete(kind)
    else next.add(kind)
    if (next.size === 0) return
    updateGraphView({ kinds: kindsParam(next) })
  }

  return (
    <div className="sw-graphcontrols">
      <GraphSearch nodes={nodes} onPick={onPick} />
      <Tabs
        value={view.scope}
        onChange={(scope) =>
          updateGraphView({ g: scope === 'chain' ? 'chain' : null, node: null, focus: null })
        }
        items={[
          { value: 'ecosystem', label: 'Repos and proposals' },
          { value: 'chain', label: 'On-chain calls' },
        ]}
      />
      <div className="sw-graphcontrols-row" aria-label="Network">
        {([undefined, 'mainnet', 'testnet'] as const).map((net) => (
          <Chip
            key={net ?? 'all'}
            active={view.network === net}
            dot={net ? `var(--net-${net})` : undefined}
            onClick={() => updateGraphView({ net: net ?? null })}
          >
            {net ?? 'Both networks'}
          </Chip>
        ))}
      </div>
      {view.scope === 'ecosystem' && (
        <div className="sw-graphcontrols-row" aria-label="Node kinds">
          {KINDS.map((kind) => (
            <Chip
              key={kind}
              active={view.kinds.has(kind)}
              dot={`var(--${KIND_COLOR[kind]})`}
              count={counts[kind]}
              onClick={() => toggleKind(kind)}
            >
              {KIND_LABEL[kind]}
            </Chip>
          ))}
        </div>
      )}
      <div className="sw-graphcontrols-row">
        <label className="sw-graphcontrols-select">
          Nodes
          <select value={view.limit} onChange={(e) => updateGraphView({ n: e.target.value })}>
            {LIMITS.map((n) => (
              <option key={n} value={n}>
                top {n.toLocaleString('en')}
              </option>
            ))}
          </select>
        </label>
        <Chip
          active={view.colourBy === 'network'}
          onClick={() => updateGraphView({ by: view.colourBy === 'kind' ? 'network' : null })}
        >
          Colour by network
        </Chip>
        <Chip active={view.glow} onClick={() => updateGraphView({ glow: view.glow ? '0' : null })}>
          Glow
        </Chip>
        <Chip
          active={view.dims === 2}
          onClick={() => updateGraphView({ d: view.dims === 2 ? null : '2' })}
        >
          Calm 2D
        </Chip>
        <Button size="sm" variant="ghost" onClick={onFit}>
          <Maximize2 size={14} />
          Reset view
        </Button>
      </div>
      {time && view.scope === 'ecosystem' && (
        <div className="sw-graphcontrols-time">
          <span>
            Repos pushed {moment(time.from).format('MMM D')} to{' '}
            {moment(time.to).format('MMM D YYYY')}
          </span>
          <RangeSlider
            label="Last push"
            min={time.min}
            max={time.max}
            from={time.from}
            to={time.to}
            onChange={onTime}
          />
        </div>
      )}
    </div>
  )
}
