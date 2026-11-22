import type { Meta, StoryObj } from '@storybook/react-vite'
import { wrapped } from '../../fixtures/wrapped'
import { Hero } from './Hero'

const meta: Meta<typeof Hero> = { title: 'sections/Hero', component: Hero, args: { data: wrapped } }
export default meta
export const Default: StoryObj<typeof Hero> = {}
