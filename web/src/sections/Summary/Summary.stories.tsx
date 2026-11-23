import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Summary } from './Summary'

const meta = { title: 'sections/Summary', component: Summary } satisfies Meta<typeof Summary>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { data: wrapped } }
