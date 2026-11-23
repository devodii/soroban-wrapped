import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Contracts } from './Contracts'

const meta = { title: 'sections/Contracts', component: Contracts } satisfies Meta<typeof Contracts>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { data: wrapped } }
