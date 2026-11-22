import type { Meta, StoryObj } from '@storybook/react-vite'
import { CopyButton } from './CopyButton'

const meta = {
  title: 'ui/CopyButton',
  component: CopyButton,
  args: { text: '# RFP draft', label: 'Copy RFP' },
} satisfies Meta<typeof CopyButton>
export default meta
export const Default: StoryObj<typeof meta> = {}
