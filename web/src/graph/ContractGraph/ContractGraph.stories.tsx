import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { ContractGraph } from './ContractGraph'

const meta = { title: 'graph/ContractGraph', component: ContractGraph } satisfies Meta<
  typeof ContractGraph
>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { graph: wrapped.graph } }
