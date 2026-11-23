import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Takeaways } from './Takeaways'

const meta = { title: 'sections/Takeaways', component: Takeaways } satisfies Meta<typeof Takeaways>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { data: wrapped } }
