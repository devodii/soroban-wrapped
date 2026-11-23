import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Segmented } from './Segmented'

const meta = { title: 'ui/Segmented', component: Segmented } satisfies Meta<typeof Segmented>
export default meta
type Story = StoryObj<typeof meta>

export const Networks: Story = {
  args: {
    label: 'Network',
    value: 'mainnet',
    onChange: () => undefined,
    options: [
      { value: 'mainnet', label: 'Mainnet', accent: 'var(--net-mainnet)' },
      { value: 'testnet', label: 'Testnet', accent: 'var(--net-testnet)' },
    ],
  },
  render: (args) => {
    const [value, setValue] = React.useState(args.value)
    return <Segmented {...args} value={value} onChange={setValue} />
  },
}
