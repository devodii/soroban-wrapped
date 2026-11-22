import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../Button/Button'
import { Drawer } from './Drawer'

const meta: Meta<typeof Drawer> = { title: 'ui/Drawer', component: Drawer }
export default meta

export const Default: StoryObj = {
  render: () => {
    const [open, setOpen] = React.useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          eyebrow="Proposal"
          title="Pause and upgrade switches"
        >
          <p>Pause and upgrade written once, behind access control.</p>
        </Drawer>
      </>
    )
  },
}
