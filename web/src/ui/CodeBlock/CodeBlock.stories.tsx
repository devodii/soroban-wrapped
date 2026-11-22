import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodeBlock } from './CodeBlock'

const meta = {
  title: 'ui/CodeBlock',
  component: CodeBlock,
  args: {
    caption: 'stellar-lend/contracts/lending/src/hot_storage.rs',
    code: 'pub fn load(env: &Env) -> Self {\n    let storage = env.storage().persistent();\n    storage.get(&Key::State).unwrap_or_default()\n}',
  },
} satisfies Meta<typeof CodeBlock>
export default meta
export const Default: StoryObj<typeof meta> = {}
