import moment from 'moment'
import type { Wrapped } from '../../lib/api-schema'
import { AreaTrend } from '../../charts/AreaTrend/AreaTrend'
import { Columns } from '../../charts/Columns/Columns'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Tile } from '../../ui/Tile/Tile'
import './Activity.scss'

export function Activity({ data }: { data: Wrapped }) {
  const at = (day: string) => moment.utc(day).valueOf()
  const calls = data.days.map((d) => ({ x: at(d.day), y: d.contract_calls }))
  const failure = data.days.map((d) => ({
    x: at(d.day),
    y: (100 * d.failed_transactions) / Math.max(d.transactions, 1),
  }))
  const record = (kind: string) => data.records.find((r) => r.kind === kind)
  const marker = (kind: string, label: string, series: { x: number; y: number }[]) => {
    const found = record(kind)
    const point = found && series.find((p) => p.x === at(found.day))
    return point ? [{ ...point, label }] : []
  }
  const later = data.months.slice(1)
  const best = later.reduce((a, b) => (b.new_contracts > a.new_contracts ? b : a), later[0])
  return (
    <>
      <SectionHeader index="01 · Activity" title="Volume, growth and failures" />
      <div className="sw-activity-grid">
        <Tile title="Contract calls per day" note="record days marked" className="sw-activity-wide">
          <AreaTrend
            label="Contract calls"
            data={calls}
            markers={[
              ...marker('most_calls', 'Busiest', calls),
              ...marker('quietest', 'Quietest', calls),
            ]}
          />
        </Tile>
        <Tile title="New contracts per month" note="January counts every contract already live">
          <Columns
            label="New contracts"
            data={data.months.map((m) => ({
              label: moment.utc(m.month).format('MMM'),
              value: m.new_contracts,
              note: `${m.contract_calls.toLocaleString('en')} calls that month`,
            }))}
            highlight={best && moment.utc(best.month).format('MMM')}
          />
        </Tile>
        <Tile title="Transactions that fail" note="% per day">
          <AreaTrend
            label="Failure rate"
            color="var(--destructive)"
            format={(n) => `${n.toFixed(0)}%`}
            data={failure}
            markers={[
              ...marker('highest_failure_rate', 'Worst', failure),
              ...marker('lowest_failure_rate', 'Best', failure),
            ]}
          />
        </Tile>
      </div>
    </>
  )
}
