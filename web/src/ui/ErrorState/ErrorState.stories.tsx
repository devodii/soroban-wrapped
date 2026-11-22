import type { Meta, StoryObj } from '@storybook/react-vite'
import { ErrorState } from './ErrorState'

const meta = {
  title: 'ui/ErrorState',
  component: ErrorState,
  args: { error: new Error('Request failed (500)'), retry: () => {} },
} satisfies Meta<typeof ErrorState>
export default meta
export const Default: StoryObj<typeof meta> = {}
