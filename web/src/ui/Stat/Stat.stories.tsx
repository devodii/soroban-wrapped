import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stat } from './Stat'

const meta = {
  title: 'ui/Stat',
  component: Stat,
  args: { label: 'Soroban repos', value: '6,447' },
} satisfies Meta<typeof Stat>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithHint: Story = { args: { hint: '4,380 on mainnet', accent: 'var(--net-mainnet)' } }
