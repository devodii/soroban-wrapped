import type { Meta, StoryObj } from '@storybook/react-vite'
import moment from 'moment'
import { wrapped } from '../../fixtures/wrapped'
import { AreaTrend } from './AreaTrend'

const meta = { title: 'charts/AreaTrend', component: AreaTrend } satisfies Meta<typeof AreaTrend>
export default meta
type Story = StoryObj<typeof meta>

const data = wrapped.days.map((d) => ({ x: moment.utc(d.day).valueOf(), y: d.contract_calls }))
const peak = data.reduce((a, b) => (b.y > a.y ? b : a))

export const Calls: Story = {
  args: { data, label: 'Contract calls', markers: [{ ...peak, label: 'Busiest day' }] },
}
