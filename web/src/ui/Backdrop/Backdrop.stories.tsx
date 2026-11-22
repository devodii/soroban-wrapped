import type { Meta, StoryObj } from '@storybook/react-vite'
import { Backdrop } from './Backdrop'

const meta = {
  title: 'ui/Backdrop',
  component: Backdrop,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Backdrop>
export default meta
export const Default: StoryObj<typeof meta> = {}
