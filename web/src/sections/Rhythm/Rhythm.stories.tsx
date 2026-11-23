import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Rhythm } from './Rhythm'

const meta = { title: 'sections/Rhythm', component: Rhythm } satisfies Meta<typeof Rhythm>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { data: wrapped } }
