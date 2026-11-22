import type { Meta, StoryObj } from '@storybook/react-vite'
import { LineChart } from './LineChart'

const day = 86_400_000
const start = Date.UTC(2026, 0, 1)
const data = Array.from({ length: 200 }, (_, i) => ({
  x: start + i * day,
  mainnet: 9000 * (1 + Math.sin(i / 14)) + i * 40,
  testnet: 5000 * (1 + Math.sin(i / 14 + 2)) + i * 40,
}))

const meta: Meta<typeof LineChart> = {
  title: 'charts/LineChart',
  component: LineChart,
  args: {
    label: 'Contract calls per day',
    data,
    series: [
      { id: 'mainnet', label: 'Mainnet', color: 'var(--net-mainnet)' },
      { id: 'testnet', label: 'Testnet', color: 'var(--net-testnet)' },
    ],
  },
}
export default meta
export const MainnetVsTestnet: StoryObj<typeof LineChart> = {}
