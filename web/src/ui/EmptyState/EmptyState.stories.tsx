import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState } from './EmptyState'

const meta = {
  title: 'ui/EmptyState',
  component: EmptyState,
  args: { title: 'No repos match', children: 'Try a broader search.' },
} satisfies Meta<typeof EmptyState>
export default meta
export const Default: StoryObj<typeof meta> = {}
