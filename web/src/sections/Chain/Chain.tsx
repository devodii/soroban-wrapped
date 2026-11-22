import * as React from 'react'
import moment from 'moment'
import type { ColumnDef } from '@tanstack/react-table'
import type { ChainDay, TopContract, TopEdge } from '../../lib/api-schema'
import { LineChart } from '../../charts/LineChart/LineChart'
import { Button } from '../../ui/Button/Button'
import { Figure } from '../../ui/Figure/Figure'
import { RangeSlider } from '../../ui/RangeSlider/RangeSlider'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Table } from '../../ui/Table/Table'
import { Tabs } from '../../ui/Tabs/Tabs'
import { Tag } from '../../ui/Tag/Tag'
import { Tile } from '../../ui/Tile/Tile'
import { Warming } from '../../ui/Warming/Warming'
import './Chain.scss'

type Metric = 'contract_calls' | 'transactions' | 'contracts_called'

const METRICS: { value: Metric; label: string }[] = [
  { value: 'contract_calls', label: 'Contract calls' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'contracts_called', label: 'Distinct contracts called' },
]

const short = (id: string) => `${id.slice(0, 5)}…${id.slice(-4)}`

const contractColumns: ColumnDef<TopContract>[] = [
  {
    accessorKey: 'contract_id',
    header: 'Contract',
    cell: ({ row }) => (
      <span className="sw-chain-id">
        <i className={`sw-chain-dot sw-chain-${row.original.network}`} />
        <code>{short(row.original.contract_id)}</code>
      </span>
    ),
  },
  {
    accessorKey: 'invocations',
    header: 'Calls',
    meta: { right: true },
    cell: ({ row }) => row.original.invocations.toLocaleString('en'),
  },
  { accessorKey: 'active_days', header: 'Active days', meta: { right: true } },
  {
    id: 'repos',
    header: 'Repos',
    cell: ({ row }) =>
      row.original.repos.length ? (
        <Tag tone="primary">{row.original.repos[0]}</Tag>
      ) : (
        <Tag>unlinked</Tag>
      ),
  },
]

export function Chain({
  days,
  contracts,
  edges,
  warming,
  onContract,
  onShowGraph,
}: {
  days: ChainDay[]
  contracts: TopContract[]
  edges: TopEdge[]
  warming: boolean
  onContract: (key: string) => void
  onShowGraph: () => void
}) {
  const [metric, setMetric] = React.useState<Metric>('contract_calls')
  const dates = React.useMemo(() => Array.from(new Set(days.map((d) => d.day))).sort(), [days])
  const [range, setRange] = React.useState<[number, number] | null>(null)
  const from = Math.min(range?.[0] ?? 0, dates.length - 1)
  const to = Math.min(range?.[1] ?? dates.length - 1, dates.length - 1)

  const { data, totals } = React.useMemo(() => {
    const inWindow = new Set(dates.slice(from, to + 1))
    const byDay = new Map<string, { x: number; mainnet: number; testnet: number }>()
    const sums = { mainnet: 0, testnet: 0 }
    days.forEach((d) => {
      if (!inWindow.has(d.day)) return
      const row = byDay.get(d.day) ?? { x: moment.utc(d.day).valueOf(), mainnet: 0, testnet: 0 }
      const key = d.network === 'mainnet' ? 'mainnet' : 'testnet'
      row[key] = d[metric]
      sums[key] += d.contract_calls
      byDay.set(d.day, row)
    })
    return { data: [...byDay.values()].sort((a, b) => a.x - b.x), totals: sums }
  }, [days, dates, from, to, metric])

  return (
    <div className="sw-chain">
      <SectionHeader index="03 · On chain" title="Mainnet and testnet, day by day">
        Daily activity across the year from the public ledger archive. Mainnet and testnet share a
        scale on purpose, so you can see how far real use trails experiments.
      </SectionHeader>
      <div className="sw-chain-grid">
        <Tile title="Activity" note={`${dates[from] ?? ''} to ${dates[to] ?? ''}`}>
          <div className="sw-chain-controls">
            <Tabs items={METRICS} value={metric} onChange={setMetric} />
          </div>
          <LineChart
            data={data}
            label={`${METRICS.find((m) => m.value === metric)?.label} per day, mainnet and testnet`}
            series={[
              { id: 'mainnet', label: 'Mainnet', color: 'var(--net-mainnet)' },
              { id: 'testnet', label: 'Testnet', color: 'var(--net-testnet)' },
            ]}
          />
          {dates.length > 1 && (
            <RangeSlider
              label="Window"
              min={0}
              max={dates.length - 1}
              from={from}
              to={to}
              onChange={(a, b) => setRange([a, b])}
            />
          )}
          <dl className="sw-chain-totals">
            <div>
              <dt>
                <i className="sw-chain-dot sw-chain-mainnet" />
                mainnet calls in window
              </dt>
              <dd>
                <Figure
                  value={totals.mainnet}
                  format={(n) =>
                    Intl.NumberFormat('en', {
                      notation: 'compact',
                      maximumFractionDigits: 1,
                    }).format(n)
                  }
                />
              </dd>
            </div>
            <div>
              <dt>
                <i className="sw-chain-dot sw-chain-testnet" />
                testnet calls in window
              </dt>
              <dd>
                <Figure
                  value={totals.testnet}
                  format={(n) =>
                    Intl.NumberFormat('en', {
                      notation: 'compact',
                      maximumFractionDigits: 1,
                    }).format(n)
                  }
                />
              </dd>
            </div>
          </dl>
        </Tile>
        <Tile title="Busiest contracts" note="all year">
          {warming ? (
            <Warming what="the busiest contracts" />
          ) : (
            <Table<TopContract>
              caption="Busiest contracts"
              data={contracts}
              columns={contractColumns}
              onRow={(row) => onContract(`${row.network}/${row.contract_id}`)}
            />
          )}
        </Tile>
      </div>
      {!warming && edges.length > 0 && (
        <Tile title="Heaviest call edges" note="who calls whom">
          <ul className="sw-chain-edges">
            {edges.map((edge) => (
              <li key={`${edge.network}${edge.caller}${edge.callee}`}>
                <i className={`sw-chain-dot sw-chain-${edge.network}`} />
                <button type="button" onClick={() => onContract(`${edge.network}/${edge.caller}`)}>
                  <code>{short(edge.caller)}</code>
                </button>
                <span aria-hidden>calls</span>
                <button type="button" onClick={() => onContract(`${edge.network}/${edge.callee}`)}>
                  <code>{short(edge.callee)}</code>
                </button>
                <b>{edge.calls.toLocaleString('en')}</b>
              </li>
            ))}
          </ul>
          <Button variant="primary" className="sw-chain-explore" onClick={onShowGraph}>
            Explore the call graph
          </Button>
        </Tile>
      )}
    </div>
  )
}
