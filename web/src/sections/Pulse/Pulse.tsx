import moment from 'moment'
import type { Wrapped } from '../../lib/api-schema'
import { LineChart } from '../../charts/LineChart/LineChart'
import { Bars } from '../../ui/Bars/Bars'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Tile } from '../../ui/Tile/Tile'
import './Pulse.scss'

const compact = (n: number) =>
  n.toLocaleString('en', { notation: 'compact', maximumFractionDigits: 1 })

export function Pulse({ data }: { data: Wrapped }) {
  const series = data.days.map((d) => ({
    x: moment.utc(d.day).valueOf(),
    calls: d.contract_calls,
    transactions: d.transactions,
  }))
  const later = data.months.slice(1)
  const best = later.reduce((a, b) => (b.new_contracts > a.new_contracts ? b : a), later[0])
  return (
    <>
      <SectionHeader index="01 · Pulse" title="A year of contract calls">
        Every day of {moment.utc(data.totals.last_day).format('YYYY')}, calls to contracts against
        all transactions on the network.
      </SectionHeader>
      <div className="sw-pulse-grid">
        <Tile title="Daily activity" note="one point per day">
          <LineChart
            label="Daily contract calls and transactions"
            data={series}
            series={[
              { id: 'transactions', label: 'Transactions', color: 'var(--chart-3)' },
              { id: 'calls', label: 'Contract calls', color: 'var(--chart-1)' },
            ]}
          />
        </Tile>
        <Tile title="New contracts a month" note="first time seen calling">
          <Bars
            rows={data.months.map((m) => ({
              id: m.month,
              label: moment.utc(m.month).format('MMMM'),
              value: m.new_contracts,
              hint: `${compact(m.contract_calls)} calls`,
            }))}
            tone="teal"
          />
          {best && (
            <p className="sw-pulse-note">
              {moment.utc(best.month).format('MMMM')} saw the most new contracts,{' '}
              <b>{best.new_contracts.toLocaleString('en')}</b>.
            </p>
          )}
        </Tile>
      </div>
    </>
  )
}
