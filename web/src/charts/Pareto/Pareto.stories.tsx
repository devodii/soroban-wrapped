import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Pareto } from './Pareto'

const meta = { title: 'charts/Pareto', component: Pareto } satisfies Meta<typeof Pareto>
export default meta
type Story = StoryObj<typeof meta>

export const Calls: Story = {
  args: {
    label: 'Share of calls by contract rank',
    points: wrapped.pareto,
    callouts: [
      { contracts: 1, label: '1 contract' },
      { contracts: 10, label: '10 contracts' },
    ],
  },
}
