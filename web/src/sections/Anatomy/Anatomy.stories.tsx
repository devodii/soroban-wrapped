import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Anatomy } from './Anatomy'

const meta = { title: 'sections/Anatomy', component: Anatomy } satisfies Meta<typeof Anatomy>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { data: wrapped } }
