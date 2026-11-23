import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bars } from './Bars'

const meta = { title: 'ui/Bars', component: Bars } satisfies Meta<typeof Bars>
export default meta
type Story = StoryObj<typeof meta>

export const Functions: Story = {
  args: {
    rows: [
      { id: 'plant', label: 'plant', value: 395298146, hint: '2 contracts' },
      { id: 'harvest', label: 'harvest', value: 351454886, hint: '16 contracts' },
      { id: 'work', label: 'work', value: 302039552, hint: '1 contract' },
      { id: 'mint', label: 'mint', value: 280009037, hint: '956 contracts' },
    ],
    format: (n: number) => n.toLocaleString('en', { notation: 'compact' }),
  },
}
