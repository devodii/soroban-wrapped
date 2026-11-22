import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tile } from './Tile'

const meta = {
  title: 'ui/Tile',
  component: Tile,
  args: {
    title: 'The field',
    note: '2026-01-01 to today',
    children: <p>Tiles hold one idea each.</p>,
  },
} satisfies Meta<typeof Tile>
export default meta
export const Default: StoryObj<typeof meta> = {}
