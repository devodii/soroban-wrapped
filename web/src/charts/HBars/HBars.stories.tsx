import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { HBars } from './HBars'

const meta = { title: 'charts/HBars', component: HBars } satisfies Meta<typeof HBars>
export default meta
type Story = StoryObj<typeof meta>

export const TopContracts: Story = {
  args: {
    label: 'Top contracts',
    rows: wrapped.top_contracts.map((c) => ({
      id: c.contract_id,
      label: `${c.contract_id.slice(0, 4)}…${c.contract_id.slice(-4)} ${c.top_function ?? ''}`,
      value: c.invocations,
    })),
  },
}
