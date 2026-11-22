import type { GraphEdge, GraphNode } from '../lib/api-schema'

export type { GraphEdge, GraphNode }

export type Kind = GraphNode['kind']
export type ColourBy = 'kind' | 'network'
export type Dims = 2 | 3

export const KINDS: Kind[] = ['proposal', 'repo', 'contract', 'library', 'bug_class']

export const KIND_LABEL: Record<Kind, string> = {
  proposal: 'Proposal',
  repo: 'Repo',
  contract: 'Contract',
  library: 'Library',
  bug_class: 'Bug class',
}

export const KIND_BLURB: Record<Kind, string> = {
  proposal: 'A pattern the data proposes to turn into a macro or library',
  repo: 'A Soroban repo that hand-writes proposals',
  contract: 'A deployed contract on mainnet or testnet',
  library: 'An existing library that already covers a proposal',
  bug_class: 'A class of bug a proposal would prevent',
}

export const KIND_COLOR: Record<Kind, string> = {
  proposal: 'kind-proposal',
  repo: 'kind-repo',
  contract: 'kind-contract',
  library: 'kind-library',
  bug_class: 'kind-bug',
}

export const NETWORK_COLOR: Record<string, string> = {
  mainnet: 'net-mainnet',
  testnet: 'net-testnet',
  both: 'net-both',
  none: 'net-none',
}

export const NETWORK_LABEL: Record<string, string> = {
  mainnet: 'Mainnet',
  testnet: 'Testnet',
  both: 'Mainnet and testnet',
  none: 'No network seen',
}

export const BASE_SIZE: Record<Kind, number> = {
  proposal: 5.5,
  repo: 2.4,
  contract: 2.2,
  library: 4,
  bug_class: 3.6,
}

export function nodeSize(node: GraphNode): number {
  return BASE_SIZE[node.kind] * (0.65 + 1.35 * Math.pow(node.weight, 0.6))
}

export interface WorkerIn {
  type: 'init'
  gen: number
  dims: Dims
  alpha: number
  nodes: { id: string; kind: Kind; x: number; y: number; z: number }[]
  links: { source: string; target: string; weight: number }[]
}

export interface WorkerOut {
  gen: number
  positions: Float32Array
  alpha: number
  settled: boolean
}
