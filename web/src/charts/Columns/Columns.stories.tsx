import type { Meta, StoryObj } from '@storybook/react-vite'
import moment from 'moment'
import { wrapped } from '../../fixtures/wrapped'
import { Columns } from './Columns'

const meta = { title: 'charts/Columns', component: Columns } satisfies Meta<typeof Columns>
export default meta
type Story = StoryObj<typeof meta>

export const NewContracts: Story = {
  args: {
    label: 'New contracts',
    highlight: 'May',
    data: wrapped.months.map((m) => ({
      label: moment.utc(m.month).format('MMM'),
      value: m.new_contracts,
    })),
  },
}
