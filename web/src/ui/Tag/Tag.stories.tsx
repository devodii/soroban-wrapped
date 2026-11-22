import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tag } from './Tag'

const meta = { title: 'ui/Tag', component: Tag, args: { children: 'mined' } } satisfies Meta<
  typeof Tag
>
export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {}
export const Primary: Story = { args: { tone: 'primary' } }
export const Ok: Story = { args: { tone: 'ok', children: 'live' } }
export const Danger: Story = { args: { tone: 'danger', children: 'critical' } }
