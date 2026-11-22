import type { Meta, StoryObj } from '@storybook/react-vite'
import { Nav } from './Nav'

const meta: Meta<typeof Nav> = {
  title: 'sections/Nav',
  component: Nav,
  args: { onPalette: () => {} },
}
export default meta
export const Default: StoryObj<typeof Nav> = {}
