import type { Meta, StoryObj } from '@storybook/react-vite'
import { Warming } from './Warming'

const meta = {
  title: 'ui/Warming',
  component: Warming,
  args: { what: 'the chain cache' },
} satisfies Meta<typeof Warming>
export default meta
export const Default: StoryObj<typeof meta> = {}
