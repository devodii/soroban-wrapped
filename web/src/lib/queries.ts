import { useQuery } from '@tanstack/react-query'
import { client, unwrap } from './api'

const REFRESH_MS = 300_000

export function useWrapped(network: 'mainnet' | 'testnet') {
  return useQuery({
    queryKey: ['wrapped', network],
    queryFn: async () =>
      unwrap(await client.GET('/api/wrapped/{network}', { params: { path: { network } } })),
    refetchInterval: REFRESH_MS,
  })
}
