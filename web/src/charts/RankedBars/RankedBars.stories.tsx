import type { Meta, StoryObj } from '@storybook/react-vite'
import { RankedBars } from './RankedBars'

const meta: Meta<typeof RankedBars> = {
  title: 'charts/RankedBars',
  component: RankedBars,
  args: {
    onSelect: () => {},
    rows: [
      { id: 'a', label: 'Pause and upgrade switches', value: 44.9 },
      { id: 'b', label: 'TTL bump helpers', value: 38 },
      { id: 'c', label: 'Auth guard', value: 31 },
    ],
  },
}
export default meta
export const Default: StoryObj<typeof RankedBars> = {}
