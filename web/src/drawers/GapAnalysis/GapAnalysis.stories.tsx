import type { Meta, StoryObj } from '@storybook/react-vite'
import { GapAnalysis } from './GapAnalysis'

const meta = { title: 'drawers/GapAnalysis', component: GapAnalysis } satisfies Meta<
  typeof GapAnalysis
>
export default meta
type Story = StoryObj<typeof meta>

export const Contribute: Story = {
  args: {
    tools: [
      {
        tool: 'soroban-sdk',
        name: 'soroban-sdk',
        url: 'https://github.com/stellar/rs-soroban-sdk',
        verdict: 'contribute',
        summary:
          'soroban-sdk is actively maintained and has related open issues for 2 of the 4 missing items, so contribute upstream.',
        reasons: [],
        items: [
          { item: 'Reusable test harness crate', status: 'missing', coverage: 0, evidence: [] },
          {
            item: 'Snapshot and golden test support',
            status: 'related',
            coverage: 0.5,
            evidence: [
              {
                title: 'Improve the in SDK fork testing experience',
                url: 'https://github.com/stellar/rs-soroban-sdk/issues/1448',
                reactions: 1,
                comments: 7,
              },
            ],
          },
        ],
      },
    ],
  },
}
