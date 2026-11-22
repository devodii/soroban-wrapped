import { setParams, useParam } from '../lib/url'
import { KINDS, type ColourBy, type Dims, type Kind } from './model'

export const LIMITS = [300, 600, 900, 1500, 2500, 4000]
const DEFAULT_LIMIT = 900

export interface GraphView {
  scope: 'ecosystem' | 'chain'
  network: 'mainnet' | 'testnet' | undefined
  kinds: Set<Kind>
  colourBy: ColourBy
  limit: number
  glow: boolean
  dims: Dims
  node: string | null
  focus: string | null
}

export function useGraphView(): GraphView {
  const scope = useParam('g')
  const net = useParam('net')
  const kinds = useParam('kinds')
  const by = useParam('by')
  const limit = Number(useParam('n')) || DEFAULT_LIMIT
  const glow = useParam('glow')
  const dims = useParam('d')
  return {
    scope: scope === 'chain' ? 'chain' : 'ecosystem',
    network: net === 'mainnet' || net === 'testnet' ? net : undefined,
    kinds: new Set(
      kinds ? (kinds.split(',').filter((k) => KINDS.includes(k as Kind)) as Kind[]) : KINDS,
    ),
    colourBy: by === 'network' ? 'network' : 'kind',
    limit: LIMITS.includes(limit) ? limit : DEFAULT_LIMIT,
    glow: glow !== '0',
    dims: dims === '2' ? 2 : 3,
    node: useParam('node'),
    focus: useParam('focus'),
  }
}

export function updateGraphView(patch: Partial<Record<string, string | null>>) {
  setParams(patch, true)
}

export function kindsParam(kinds: Set<Kind>): string | null {
  return kinds.size === KINDS.length ? null : [...kinds].join(',')
}
