import type { Meta, StoryObj } from '@storybook/react-vite'
import moment from 'moment'
import { wrapped } from '../../fixtures/wrapped'
import { Stacked } from './Stacked'

const meta = { title: 'charts/Stacked', component: Stacked } satisfies Meta<typeof Stacked>
export default meta
type Story = StoryObj<typeof meta>

export const Split: Story = {
  args: {
    label: 'Calls from the top 3 contracts and from everyone else',
    series: [
      { key: 'giants', label: 'Top 3 contracts', color: 'var(--chart-1)' },
      { key: 'others', label: 'Everyone else', color: 'var(--chart-2)' },
    ],
    data: wrapped.split.map((m) => ({
      label: moment.utc(m.month).format('MMM'),
      giants: m.giants,
      others: m.others,
    })),
  },
}
