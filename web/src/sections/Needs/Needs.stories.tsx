import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { needs } from '../../fixtures/wrapped'
import { Needs } from './Needs'

const meta: Meta<typeof Needs> = {
  title: 'sections/Needs',
  component: Needs,
  args: { needs, onNeed: () => {} },
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
}
export default meta
export const Default: StoryObj<typeof Needs> = {}
