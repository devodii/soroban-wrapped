import type { Meta, StoryObj } from '@storybook/react-vite'
import { ContractId } from './ContractId'

const meta = { title: 'ui/ContractId', component: ContractId } satisfies Meta<typeof ContractId>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { id: 'CDL74RF5BLYR2YBLCCI7F5FB6TPSCLKEJUBSD2RSVWZ4YHF3VMFAIGWA' },
}
