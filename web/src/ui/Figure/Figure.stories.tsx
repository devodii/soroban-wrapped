import type { Meta, StoryObj } from '@storybook/react-vite'
import { Figure } from './Figure'

const meta = {
  title: 'ui/Figure',
  component: Figure,
  args: { value: 6447 },
  decorators: [
    (Story) => (
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-display)',
          color: 'var(--brand)',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Figure>
export default meta
export const Default: StoryObj<typeof meta> = {}
