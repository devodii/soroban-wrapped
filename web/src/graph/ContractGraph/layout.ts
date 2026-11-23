import { forceCenter, forceLink, forceManyBody, forceSimulation } from 'd3-force-3d'
import type { Graph } from '../../lib/api-schema'

const TICKS = 320
const LINK_DISTANCE = 26
const REPULSION = -70

export interface Placed {
  id: string
  x: number
  y: number
  z: number
  radius: number
  rank: number
}

export function place(graph: Graph): Placed[] {
  const peak = Math.log(Math.max(...graph.nodes.map((n) => n.edge_calls), 2))
  const nodes = graph.nodes.map((n, rank) => ({
    id: n.contract_id,
    rank,
    radius: 0.7 + 2.6 * (Math.log(Math.max(n.edge_calls, 2)) / peak),
    x: 0,
    y: 0,
    z: 0,
  }))
  const links = graph.edges.map((e) => ({ source: e.caller, target: e.callee }))
  const simulation = forceSimulation(nodes, 3)
  simulation.force(
    'link',
    forceLink(links)
      .id((n) => (n as { id: string }).id)
      .distance(LINK_DISTANCE),
  )
  simulation.force('charge', forceManyBody().strength(REPULSION))
  simulation.force('center', forceCenter(0, 0, 0))
  simulation.stop()
  simulation.tick(TICKS)
  return nodes.map((n) => ({ ...n, z: n.z ?? 0 }))
}
