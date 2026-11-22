import type { Meta, StoryObj } from '@storybook/react-vite'
import { Section } from './Section'

const meta: Meta<typeof Section> = {
  title: 'ui/Section',
  component: Section,
  args: { title: 'Why it scores high', children: 'Content goes here.' },
}
export default meta
export const Default: StoryObj<typeof Section> = {}
