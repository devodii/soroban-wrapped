import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Composability } from './Composability'

const meta = { title: 'sections/Composability', component: Composability } satisfies Meta<
  typeof Composability
>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { data: wrapped } }
