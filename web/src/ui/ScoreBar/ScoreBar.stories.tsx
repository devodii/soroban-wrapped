import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScoreBar } from './ScoreBar'

const meta = {
  title: 'ui/ScoreBar',
  component: ScoreBar,
  args: { label: 'owners', value: 0.84 },
} satisfies Meta<typeof ScoreBar>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Teal: Story = { args: { tone: 'teal', label: 'mainnet', value: 0.18 } }
export const Negative: Story = {
  args: {
    negative: true,
    label: 'covered',
    value: 0.69,
    explain: 'Already covered by an existing library',
  },
}
