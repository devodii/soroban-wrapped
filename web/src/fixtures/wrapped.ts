import type { NeedItem, PatternItem, ProposalItem, Wrapped } from '../lib/api-schema'

export const proposal: ProposalItem = {
  id: 'pausable-upgradeable',
  name: 'Pause and upgrade switches',
  kind: 'derive',
  summary: 'Pause and upgrade written once, behind access control.',
  origin: 'seed',
  status: 'supported',
  score: 44.9,
  covered_by: ['openzeppelin-stellar'],
  components: { owners: 0.84, independence: 0.45, mainnet: 0.18, recency: 0.6, fixes: 1, loc: 1 },
  weighted: {},
  repos: 1292,
  owners: 1102,
  mainnet_repos: 227,
  fix_commits: 9023,
  occurrences: 8830,
  copy_share: 0.55,
  comments: 0,
}

export const proposals: ProposalItem[] = [
  proposal,
  {
    ...proposal,
    id: 'ttl',
    name: 'Storage TTL bump helpers',
    kind: 'macro',
    score: 41.2,
    origin: 'mined',
  },
  { ...proposal, id: 'auth', name: 'Require auth guard', kind: 'idiom', score: 36.8 },
  { ...proposal, id: 'init', name: 'Init once check', kind: 'idiom', score: 29.4 },
]

export const pattern: PatternItem = {
  id: 'storage-ttl',
  category: 'boilerplate',
  description: 'extend_ttl calls repeated around every storage write',
  origin: 'seed',
  status: 'active',
  diff: null,
  repos: 3048,
  occurrences: 16108,
  sample: 'env.storage().instance().extend_ttl(100, 100);',
  sample_repo: 'stellar/soroban-examples',
  sample_path: 'token/src/contract.rs',
  proposals: ['ttl'],
}

export const patterns: PatternItem[] = [
  pattern,
  {
    ...pattern,
    id: 'require-auth',
    repos: 2411,
    description: 'require_auth on the first line of public functions',
  },
  { ...pattern, id: 'ensure-errors', repos: 1204, description: 'error enums converted by hand' },
]

export const need: NeedItem = {
  id: 'key-management-signing',
  title: 'Key management, custody and hardware signing',
  category: 'security',
  origin: 'seed',
  status: 'open',
  score: 82.2,
  summary: 'Teams handle deploy keys and signers with ad hoc secrets and weak rotation.',
  pain_issues: 10728,
  pain_owners: 835,
  issues: 30944,
  repos: 5617,
  owners: 3486,
  open_issues: 4648,
  custom_repos: 1968,
  questions: 153,
  components: { pain: 0.98, custom: 0.93, owners: 0.96 },
  priority: 'high',
  comments: 0,
  tools: [],
}

export const needs: NeedItem[] = [
  need,
  {
    ...need,
    id: 'wasm-size',
    title: 'WASM size budgeting in CI',
    category: 'dev-workflow',
    score: 74.1,
    tools: ['stellar-cli'],
  },
  {
    ...need,
    id: 'fuzz',
    title: 'Fuzzing and property testing harness',
    category: 'testing',
    score: 69.3,
    tools: ['cargo-fuzz-soroban'],
  },
]

const days = Array.from({ length: 120 }, (_, i) => {
  const day = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10)
  return ['mainnet', 'testnet'].map((network, n) => ({
    network,
    day,
    ledgers: 15000,
    transactions: 120000 + i * 900 * (n + 1),
    failed_transactions: 4000,
    operations: 300000,
    contract_calls: 60000 + i * 700 * (n + 1) + (n ? 20000 : 0),
    contracts_called: 800,
  }))
}).flat()

export const wrapped: Wrapped = {
  soroban_repos: 6447,
  stellar_repos: 3796,
  mainnet_repos: 4380,
  testnet_repos: 5582,
  proposals: 136,
  needs: 101,
  patterns: 104,
  mainnet_contracts: 1123,
  testnet_contracts: 7805,
  live_contracts: 1978,
  functions: 1311821,
  commits: 569590,
  issues: 636237,
  comments: 0,
  first_day: '2026-01-01',
  last_day: '2026-04-30',
  top_proposals: proposals,
  top_patterns: patterns,
  top_needs: needs,
  days,
  top_contracts: [],
  top_edges: [],
  patterns_warming: false,
  chain_warming: false,
}
