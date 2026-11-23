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
      label: c.name ?? c.contract_id,
      mono: !c.name,
      note: c.top_function,
      href: c.registry_url,
      value: c.invocations,
    })),
  },
}
