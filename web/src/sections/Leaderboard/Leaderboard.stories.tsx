import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Leaderboard } from './Leaderboard'

const meta = { title: 'sections/Leaderboard', component: Leaderboard } satisfies Meta<
  typeof Leaderboard
>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { data: wrapped } }
