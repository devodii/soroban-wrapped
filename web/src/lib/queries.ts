import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client, unwrap } from './api'
import type { CommentCreate, GraphResponse } from './api-schema'

const WARM_POLL_MS = 4000

export function useWrapped() {
  return useQuery({
    queryKey: ['wrapped'],
    queryFn: async () => unwrap(await client.GET('/api/v2/wrapped')),
    refetchInterval: (query) =>
      query.state.data?.patterns_warming || query.state.data?.chain_warming ? WARM_POLL_MS : false,
  })
}

export interface GraphParams {
  scope: 'ecosystem' | 'chain'
  focus?: string
  limit: number
  network?: 'mainnet' | 'testnet'
}

export function graphQuery(params: GraphParams) {
  return {
    queryKey: ['graph', params] as const,
    queryFn: async () =>
      unwrap(
        await client.GET('/api/v2/graph', {
          params: { query: { ...params } },
        }),
      ),
    placeholderData: keepPreviousData,
    refetchInterval: (query: { state: { data?: GraphResponse } }) =>
      query.state.data?.warming ? WARM_POLL_MS : false,
  }
}

export function useGraph(params: GraphParams) {
  return useQuery(graphQuery(params))
}

export function fetchNeighbours(id: string, limit = 40) {
  return client.GET('/api/v2/neighbours', { params: { query: { id, limit } } }).then(unwrap)
}

export function useProposal(id: string | null) {
  return useQuery({
    queryKey: ['proposal', id],
    enabled: !!id,
    queryFn: async () =>
      unwrap(
        await client.GET('/api/v2/proposals/{proposal_id}', {
          params: { path: { proposal_id: id ?? '' } },
        }),
      ),
  })
}

export function useProposalContracts(id: string | null) {
  return useQuery({
    queryKey: ['proposal-contracts', id],
    enabled: !!id,
    queryFn: async () =>
      unwrap(
        await client.GET('/api/v2/proposals/{proposal_id}/contracts', {
          params: { path: { proposal_id: id ?? '' } },
        }),
      ),
  })
}

export function useProposals(enabled: boolean) {
  return useQuery({
    queryKey: ['proposals'],
    enabled,
    queryFn: async () => unwrap(await client.GET('/api/v2/proposals')),
  })
}

export function useNeeds(enabled: boolean) {
  return useQuery({
    queryKey: ['needs'],
    enabled,
    queryFn: async () => unwrap(await client.GET('/api/v2/needs')),
  })
}

export function useNeed(id: string | null) {
  return useQuery({
    queryKey: ['need', id],
    enabled: !!id,
    queryFn: async () =>
      unwrap(
        await client.GET('/api/v2/needs/{need_id}', { params: { path: { need_id: id ?? '' } } }),
      ),
  })
}

export function useRepo(fullName: string | null) {
  const [owner = '', name = ''] = (fullName ?? '').split('/')
  return useQuery({
    queryKey: ['repo', fullName],
    enabled: !!fullName,
    queryFn: async () =>
      unwrap(
        await client.GET('/api/v2/repos/{owner}/{name}', { params: { path: { owner, name } } }),
      ),
  })
}

export function useContract(key: string | null) {
  const [network = '', contractId = ''] = (key ?? '').split('/')
  return useQuery({
    queryKey: ['contract', key],
    enabled: !!key,
    queryFn: async () =>
      unwrap(
        await client.GET('/api/v2/contracts/{network}/{contract_id}', {
          params: { path: { network, contract_id: contractId } },
        }),
      ),
  })
}

export function useSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    enabled: q.trim().length >= 2,
    placeholderData: keepPreviousData,
    queryFn: async () => unwrap(await client.GET('/api/v2/search', { params: { query: { q } } })),
  })
}

export function useComments(kind: CommentCreate['target_kind'], id: string | null) {
  return useQuery({
    queryKey: ['comments', kind, id],
    enabled: !!id,
    queryFn: async () =>
      unwrap(
        await client.GET('/api/v2/comments', {
          params: { query: { target_kind: kind, target_id: id ?? '' } },
        }),
      ),
  })
}

export function useAddComment(kind: CommentCreate['target_kind'], id: string) {
  const queries = useQueryClient()
  return useMutation({
    mutationFn: async (input: Pick<CommentCreate, 'author' | 'body'>) =>
      unwrap(
        await client.POST('/api/v2/comments', {
          body: { target_kind: kind, target_id: id, ...input },
        }),
      ),
    onSuccess: () => queries.invalidateQueries({ queryKey: ['comments', kind, id] }),
  })
}
