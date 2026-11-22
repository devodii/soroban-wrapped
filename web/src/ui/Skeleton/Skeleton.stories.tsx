import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './Skeleton'

const meta = {
  title: 'ui/Skeleton',
  component: Skeleton,
  args: { width: '18rem', height: '1.5rem' },
} satisfies Meta<typeof Skeleton>
export default meta
type Story = StoryObj<typeof meta>

export const Line: Story = {}
export const Block: Story = { args: { width: '100%', height: '9rem' } }
