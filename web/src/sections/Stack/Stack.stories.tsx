import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Stack } from './Stack'

const meta = { title: 'sections/Stack', component: Stack } satisfies Meta<typeof Stack>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { data: wrapped } }
