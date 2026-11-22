import * as React from 'react'
import { Graph2D } from '../../graph/Graph2D/Graph2D'
import { Graph3D } from '../../graph/Graph3D/Graph3D'
import { GraphControls, type TimeWindow } from '../../graph/GraphControls/GraphControls'
import { GraphStore } from '../../graph/GraphStore/GraphStore'
import { Legend } from '../../graph/Legend/Legend'
import { Minimap } from '../../graph/Minimap/Minimap'
import { NodeCard } from '../../graph/NodeCard/NodeCard'
import type { RigApi } from '../../graph/CameraRig/CameraRig'
import { KINDS, type Kind } from '../../graph/model'
import { updateGraphView, useGraphView } from '../../graph/useGraphView'
import { useGraphData } from '../../graph/useGraphData'
import { Card } from '../../ui/Card/Card'
import { ErrorState } from '../../ui/ErrorState/ErrorState'
import { Skeleton } from '../../ui/Skeleton/Skeleton'
import { Warming } from '../../ui/Warming/Warming'
import './GraphSection.scss'

export type OpenEntity = { kind: 'proposal' | 'repo' | 'contract'; id: string }

export function entityOf(nodeId: string): OpenEntity | null {
  const [kind, ...rest] = nodeId.split(':')
  if (kind === 'proposal' || kind === 'repo') return { kind, id: rest.join(':') }
  if (kind === 'contract') return { kind, id: rest.join('/') }
  return null
}

function supportsWebgl(): boolean {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

export default function GraphSection({ onOpen }: { onOpen: (entity: OpenEntity) => void }) {
  const view = useGraphView()
  const store = React.useMemo(() => new GraphStore(), [])
  const rig = React.useRef<RigApi | null>(null)
  const setRig = React.useCallback((api: RigApi) => {
    rig.current = api
  }, [])
  const [hovered, setHovered] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [range, setRange] = React.useState<[number, number] | null>(null)
  const webgl = React.useMemo(supportsWebgl, [])
  const dims = webgl && view.dims === 3 ? 3 : 2

  const data = useGraphData({
    scope: view.scope,
    focus: view.focus ?? undefined,
    limit: view.limit,
    network: view.network,
  })

  const previousIds = React.useRef('')
  React.useEffect(() => {
    const ids = data.nodes.map((n) => n.id).join('|')
    const reheat = previousIds.current !== '' && ids !== previousIds.current
    previousIds.current = ids
    store.setData(data.nodes, data.edges, dims, reheat)
  }, [store, data.nodes, data.edges, dims])

  React.useEffect(() => () => store.dispose(), [store])

  const span = React.useMemo(() => {
    const times = data.nodes
      .filter((n) => n.kind === 'repo' && n.pushed_at)
      .map((n) => new Date(n.pushed_at!).getTime())
    return times.length ? { min: Math.min(...times), max: Math.max(...times) } : null
  }, [data.nodes])

  const time: TimeWindow | null = span
    ? {
        ...span,
        from: Math.max(range?.[0] ?? span.min, span.min),
        to: Math.min(range?.[1] ?? span.max, span.max),
      }
    : null

  React.useEffect(() => {
    const mask = new Uint8Array(data.nodes.length).fill(1) as Uint8Array<ArrayBuffer>
    data.nodes.forEach((n, i) => {
      if (!view.kinds.has(n.kind)) mask[i] = 0
      if (time && n.kind === 'repo' && n.pushed_at) {
        const t = new Date(n.pushed_at).getTime()
        if (t < time.from || t > time.to) mask[i] = 0
      }
    })
    if (time) {
      data.nodes.forEach((n, i) => {
        if (n.kind !== 'contract' || !mask[i]) return
        const repos = store.neighbourIndices(i).filter((j) => data.nodes[j]?.kind === 'repo')
        if (repos.length > 0 && repos.every((j) => !mask[j])) mask[i] = 0
      })
    }
    store.setVisible(mask)
  }, [store, data.nodes, view.kinds, time?.from, time?.to])

  React.useEffect(() => {
    store.setSelected(view.node)
  }, [store, view.node, data.nodes])

  React.useEffect(() => {
    if (!view.node || data.isPending || store.index.has(view.node)) return
    data.expand(view.node).catch(() => updateGraphView({ node: null }))
  }, [view.node, data.isPending, data.nodes])

  const select = React.useCallback((id: string | null) => updateGraphView({ node: id }), [])
  const hover = React.useCallback(
    (id: string | null) => {
      store.setHover(id)
      setHovered(id)
    },
    [store],
  )

  const counts = React.useMemo(() => {
    const c = Object.fromEntries(KINDS.map((k) => [k, 0])) as Record<Kind, number>
    data.nodes.forEach((n) => (c[n.kind] += 1))
    return c
  }, [data.nodes])

  const selected = view.node ? data.nodes.find((n) => n.id === view.node) : undefined
  const neighbours = selected
    ? store
        .neighbourIndices(store.index.get(selected.id) ?? -1)
        .map((i) => store.nodes[i]!)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 12)
    : []
  const caption = hovered ? data.nodes.find((n) => n.id === hovered) : undefined
  const loading = data.isPending && data.nodes.length === 0

  const expand = async () => {
    if (!selected) return
    setBusy(true)
    try {
      await data.expand(selected.id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="sw-graphsection">
      <div className="sw-graphsection-stage">
        {!loading && !data.warming && dims === 3 && (
          <Graph3D
            store={store}
            colourBy={view.colourBy}
            glow={view.glow}
            selectedId={view.node}
            onHover={hover}
            onSelect={select}
            onRig={setRig}
          />
        )}
        {!loading && !data.warming && dims === 2 && (
          <Graph2D store={store} colourBy={view.colourBy} onHover={hover} onSelect={select} />
        )}
        {loading && <Skeleton width="100%" height="100%" className="sw-graphsection-skeleton" />}
        {data.warming && (
          <div className="sw-graphsection-center">
            <Warming what="the on-chain call graph" />
          </div>
        )}
        {data.error && (
          <div className="sw-graphsection-center">
            <ErrorState error={data.error} retry={() => data.refetch()} />
          </div>
        )}
        <div className="sw-graphsection-controls">
          <Card tone="glass">
            <details open={window.matchMedia('(min-width: 56rem)').matches}>
              <summary>Explore and filter</summary>
              <GraphControls
                view={view}
                nodes={data.nodes}
                counts={counts}
                time={time}
                onTime={(from, to) => setRange([from, to])}
                onPick={(id) => updateGraphView({ node: id })}
                onFit={() => rig.current?.fit()}
              />
            </details>
          </Card>
        </div>
        {selected && (
          <div className="sw-graphsection-card">
            <NodeCard
              node={selected}
              neighbours={neighbours}
              busy={busy}
              onClose={() => select(null)}
              onOpen={() => {
                const entity = entityOf(selected.id)
                if (entity) onOpen(entity)
              }}
              onExpand={expand}
              onFocus={() => updateGraphView({ focus: selected.id })}
              onPick={select}
            />
          </div>
        )}
        <div className="sw-graphsection-legend">
          <Card tone="glass">
            <Legend colourBy={view.colourBy} />
          </Card>
        </div>
        {!loading && !data.warming && (
          <div className="sw-graphsection-minimap">
            <Minimap store={store} onSelect={select} />
          </div>
        )}
        <div className="sw-graphsection-caption" aria-live="polite">
          {caption
            ? caption.label
            : `${data.nodes.length.toLocaleString('en')} of ${data.total.toLocaleString('en')} nodes shown`}
        </div>
      </div>
    </div>
  )
}
