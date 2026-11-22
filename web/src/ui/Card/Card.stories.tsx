import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from './Card'

const meta = {
  title: 'ui/Card',
  component: Card,
  args: { children: 'Hand-written helper `load`: 197 owners rewrote it' },
} satisfies Meta<typeof Card>
export default meta
type Story = StoryObj<typeof meta>

export const Plain: Story = {}
export const Glass: Story = { args: { tone: 'glass' } }
export const Accent: Story = { args: { tone: 'accent' } }
export const Interactive: Story = { args: { className: 'sw-card-interactive' } }
