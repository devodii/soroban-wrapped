import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Chain } from './Chain'

const contract = {
  network: 'mainnet',
  contract_id: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
  invocations: 1_204_332,
  successful: 1_100_000,
  peak_daily_callers: 900,
  active_days: 210,
  first_day: '2026-01-01',
  last_day: '2026-04-30',
  live: true,
  repos: ['stellar/soroban-examples'],
}

const meta: Meta<typeof Chain> = {
  title: 'sections/Chain',
  component: Chain,
  args: {
    days: wrapped.days,
    contracts: [contract, { ...contract, network: 'testnet', repos: [], invocations: 820_000 }],
    edges: [
      {
        network: 'mainnet',
        caller: contract.contract_id,
        callee: 'CBQHNAXSI55GX2GN6D67GK7BHVPSLJUGZQEU7WJ5LKR5PNUCGLIMAO4K',
        calls: 90_000,
        successful: 90_000,
        active_days: 40,
      },
    ],
    warming: false,
    onContract: () => {},
    onShowGraph: () => {},
  },
}
export default meta
export const Default: StoryObj<typeof Chain> = {}
export const Warming: StoryObj<typeof Chain> = { args: { warming: true } }
