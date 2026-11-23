import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Pulse } from './Pulse'

const meta = { title: 'sections/Pulse', component: Pulse } satisfies Meta<typeof Pulse>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { data: wrapped } }
