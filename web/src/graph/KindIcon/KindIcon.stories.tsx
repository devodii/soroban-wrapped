import type { Meta, StoryObj } from '@storybook/react-vite'
import { KindIcon } from './KindIcon'
import { KINDS } from '../model'

const meta: Meta<typeof KindIcon> = { title: 'graph/KindIcon', component: KindIcon }
export default meta

export const AllKinds: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      {KINDS.map((kind) => (
        <KindIcon key={kind} kind={kind} size={32} />
      ))}
    </div>
  ),
}
