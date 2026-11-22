import type { Meta, StoryObj } from '@storybook/react-vite'
import { Legend } from './Legend'

const meta: Meta<typeof Legend> = {
  title: 'graph/Legend',
  component: Legend,
  args: { colourBy: 'kind' },
}
export default meta
export const ByKind: StoryObj<typeof Legend> = {}
export const ByNetwork: StoryObj<typeof Legend> = { args: { colourBy: 'network' } }
