import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNeighbours, graphQuery, type GraphParams } from '../lib/queries'
import type { GraphEdge, GraphNode } from './model'

interface Extra {
  key: string
  nodes: Map<string, GraphNode>
  edges: Map<string, GraphEdge>
}

const EMPTY: Extra = { key: '', nodes: new Map(), edges: new Map() }

const edgeKey = (e: GraphEdge) => `${e.src}>${e.dst}:${e.kind}`

export function useGraphData(params: GraphParams) {
  const query = useQuery(graphQuery(params))
  const key = JSON.stringify(params)
  const [extra, setExtra] = React.useState<Extra>({ key, nodes: new Map(), edges: new Map() })
  const current = extra.key === key ? extra : EMPTY

  const merge = React.useCallback(
    (nodes: GraphNode[], edges: GraphEdge[]) => {
      setExtra((previous) => {
        const base = previous.key === key ? previous : { key, nodes: new Map(), edges: new Map() }
        const next = { key, nodes: new Map(base.nodes), edges: new Map(base.edges) }
        nodes.forEach((n) => next.nodes.set(n.id, n))
        edges.forEach((e) => next.edges.set(edgeKey(e), e))
        return next
      })
    },
    [key],
  )

  const expand = React.useCallback(
    async (id: string) => {
      const found = await fetchNeighbours(id)
      merge(found.center ? [found.center, ...found.nodes] : found.nodes, found.edges)
      return found
    },
    [merge],
  )

  const { nodes, edges } = React.useMemo(() => {
    const byId = new Map<string, GraphNode>()
    query.data?.nodes.forEach((n) => byId.set(n.id, n))
    current.nodes.forEach((n, id) => {
      if (!byId.has(id)) byId.set(id, n)
    })
    const byEdge = new Map<string, GraphEdge>()
    query.data?.edges.forEach((e) => byEdge.set(edgeKey(e), e))
    current.edges.forEach((e, k) => byEdge.set(k, e))
    const known = [...byEdge.values()].filter((e) => byId.has(e.src) && byId.has(e.dst))
    return { nodes: [...byId.values()], edges: known }
  }, [query.data, current])

  return {
    nodes,
    edges,
    expand,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
    warming: query.data?.warming ?? false,
    truncated: query.data?.truncated ?? false,
    total: query.data?.total_nodes ?? 0,
  }
}
