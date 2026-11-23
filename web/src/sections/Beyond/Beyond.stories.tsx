import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Beyond } from './Beyond'

const meta = { title: 'sections/Beyond', component: Beyond } satisfies Meta<typeof Beyond>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { data: wrapped } }
