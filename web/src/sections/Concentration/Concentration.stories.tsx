import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Concentration } from './Concentration'

const meta = { title: 'sections/Concentration', component: Concentration } satisfies Meta<
  typeof Concentration
>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { data: wrapped } }
