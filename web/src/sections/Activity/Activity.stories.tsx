import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Activity } from './Activity'

const meta = { title: 'sections/Activity', component: Activity } satisfies Meta<typeof Activity>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { data: wrapped } }
