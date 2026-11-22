import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tooltip } from './Tooltip'

const meta: Meta<typeof Tooltip> = { title: 'ui/Tooltip', component: Tooltip }
export default meta

export const Default: StoryObj<typeof Tooltip> = {
  args: {
    content: 'Share of distinct owners who wrote this independently',
    children: <button>Hover me</button>,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '4rem' }}>
        <Story />
      </div>
    ),
  ],
}
