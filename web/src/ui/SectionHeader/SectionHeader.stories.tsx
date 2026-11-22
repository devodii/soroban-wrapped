import type { Meta, StoryObj } from '@storybook/react-vite'
import { SectionHeader } from './SectionHeader'

const meta: Meta<typeof SectionHeader> = {
  title: 'ui/SectionHeader',
  component: SectionHeader,
  args: {
    index: '01',
    title: 'What developers write by hand',
    children: 'Ranked by how many owners wrote it independently.',
  },
}
export default meta
export const Default: StoryObj<typeof SectionHeader> = {}
