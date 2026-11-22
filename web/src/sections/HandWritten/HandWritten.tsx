import * as React from 'react'
import type { PatternItem, ProposalItem } from '../../lib/api-schema'
import { useProposals } from '../../lib/queries'
import { RankedBars } from '../../charts/RankedBars/RankedBars'
import { Button } from '../../ui/Button/Button'
import { Chip } from '../../ui/Chip/Chip'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Table } from '../../ui/Table/Table'
import { Tag } from '../../ui/Tag/Tag'
import { Tile } from '../../ui/Tile/Tile'
import { Warming } from '../../ui/Warming/Warming'
import type { ColumnDef } from '@tanstack/react-table'
import './HandWritten.scss'

const SHOWN = 12

const columns: ColumnDef<ProposalItem>[] = [
  { accessorKey: 'name', header: 'Proposal', cell: ({ row }) => row.original.name },
  { accessorKey: 'kind', header: 'Kind', cell: ({ row }) => <Tag>{row.original.kind}</Tag> },
  {
    accessorKey: 'origin',
    header: 'Origin',
    cell: ({ row }) => (
      <Tag tone={row.original.origin === 'mined' ? 'primary' : 'neutral'}>
        {row.original.origin}
      </Tag>
    ),
  },
  {
    accessorKey: 'owners',
    header: 'Owners',
    meta: { right: true },
    cell: ({ row }) => row.original.owners.toLocaleString('en'),
  },
  {
    accessorKey: 'repos',
    header: 'Repos',
    meta: { right: true },
    cell: ({ row }) => row.original.repos.toLocaleString('en'),
  },
  {
    accessorKey: 'score',
    header: 'Reuse score',
    meta: { right: true },
    cell: ({ row }) => row.original.score.toFixed(1),
  },
]

export function HandWritten({
  proposals,
  patterns,
  patternsWarming,
  onProposal,
  onPattern,
}: {
  proposals: ProposalItem[]
  patterns: PatternItem[]
  patternsWarming: boolean
  onProposal: (id: string) => void
  onPattern: (id: string) => void
}) {
  const [origin, setOrigin] = React.useState<'all' | 'seed' | 'mined'>('all')
  const [all, setAll] = React.useState(false)
  const full = useProposals(all)
  const source = all && full.data ? full.data : proposals
  const filtered = source.filter((p) => origin === 'all' || p.origin === origin)

  return (
    <div className="sw-handwritten">
      <SectionHeader index="01 · Hand written" title="What every team writes again">
        We matched 100+ patterns across every Soroban repo, then scored each by how many different
        owners wrote it on their own. The more independent rewrites, the stronger the case for a
        macro.
      </SectionHeader>
      <div className="sw-handwritten-grid">
        <Tile title="Most reused proposals" note="reuse score">
          <div className="sw-handwritten-chips">
            {(['all', 'seed', 'mined'] as const).map((value) => (
              <Chip key={value} active={origin === value} onClick={() => setOrigin(value)}>
                {value === 'all' ? 'All origins' : value}
              </Chip>
            ))}
          </div>
          <RankedBars
            rows={filtered
              .slice(0, SHOWN)
              .map((p) => ({ id: p.id, label: p.name, value: p.score }))}
            onSelect={onProposal}
          />
          <p className="sw-handwritten-hint">
            Select a bar for the evidence, sample code and linked repos.
          </p>
        </Tile>
        <Tile title="Patterns found in the most repos" note="distinct repos">
          {patternsWarming ? (
            <Warming what="the pattern counts" />
          ) : (
            <RankedBars
              rows={patterns.map((p) => ({ id: p.id, label: p.id, value: p.repos }))}
              format={(n) => n.toLocaleString('en')}
              onSelect={onPattern}
            />
          )}
        </Tile>
      </div>
      <div className="sw-handwritten-all">
        {all ? (
          full.data ? (
            <Table<ProposalItem>
              caption="All proposals"
              data={filtered}
              columns={columns}
              initialSort={[{ id: 'score', desc: true }]}
              onRow={(row) => onProposal(row.id)}
            />
          ) : (
            <Warming what="every proposal" />
          )
        ) : (
          <Button onClick={() => setAll(true)}>Show every proposal</Button>
        )}
      </div>
    </div>
  )
}
