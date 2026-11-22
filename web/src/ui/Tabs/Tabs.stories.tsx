import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs } from './Tabs'

const meta: Meta = { title: 'ui/Tabs', component: Tabs }
export default meta

export const Default: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState('calls')
    return (
      <Tabs
        value={value}
        onChange={setValue}
        items={[
          { value: 'calls', label: 'Contract calls' },
          { value: 'tx', label: 'Transactions' },
          { value: 'ops', label: 'Operations' },
        ]}
      />
    )
  },
}
