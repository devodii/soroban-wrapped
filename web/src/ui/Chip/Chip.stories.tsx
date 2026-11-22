import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chip } from './Chip'

const meta = { title: 'ui/Chip', component: Chip, args: { children: 'Mainnet' } } satisfies Meta<
  typeof Chip
>
export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {}
export const Active: Story = { args: { active: true } }
export const WithDotAndCount: Story = { args: { dot: 'var(--kind-repo)', count: 1423 } }
