import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CommandPalette } from './CommandPalette'

const meta: Meta = { title: 'ui/CommandPalette', component: CommandPalette } satisfies Meta<
  typeof CommandPalette
>
export default meta
export const Default: StoryObj = {
  render: () => {
    const [query, setQuery] = React.useState('')
    return (
      <CommandPalette
        open
        onClose={() => {}}
        query={query}
        onQuery={setQuery}
        commands={[
          { id: '1', group: 'Sections', label: 'Hand-written patterns', run: () => {} },
          { id: '2', group: 'Sections', label: 'Tooling needs', run: () => {} },
          {
            id: '3',
            group: 'Proposals',
            label: 'Pause and upgrade switches',
            hint: 'derive',
            run: () => {},
          },
        ]}
      />
    )
  },
}
