import type { Meta, StoryObj } from '@storybook/react-vite'
import { Markdown } from './Markdown'

const meta: Meta<typeof Markdown> = {
  title: 'ui/Markdown',
  component: Markdown,
  args: {
    children:
      '# RFP: Key management\n\nPriority: high\n\n## Deliverables\n- Signer abstraction for CLI and CI\n- Rotation and recovery playbooks\n\nSee [stellar-cli](https://github.com/stellar/stellar-cli).',
  },
}
export default meta
export const Default: StoryObj<typeof Markdown> = {}
