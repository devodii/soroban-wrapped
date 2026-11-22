import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { patterns, proposals } from '../../fixtures/wrapped'
import { HandWritten } from './HandWritten'

const meta: Meta<typeof HandWritten> = {
  title: 'sections/HandWritten',
  component: HandWritten,
  args: { proposals, patterns, patternsWarming: false, onProposal: () => {}, onPattern: () => {} },
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
}
export default meta
export const Default: StoryObj<typeof HandWritten> = {}
export const Warming: StoryObj<typeof HandWritten> = { args: { patternsWarming: true } }
