import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Hero } from './Hero'

const meta = { title: 'sections/Hero', component: Hero } satisfies Meta<typeof Hero>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { data: wrapped } }
