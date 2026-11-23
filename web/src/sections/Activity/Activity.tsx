import moment from 'moment'
import type { Wrapped } from '../../lib/api-schema'
import { AreaTrend } from '../../charts/AreaTrend/AreaTrend'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Tile } from '../../ui/Tile/Tile'
import './Activity.scss'

export function Activity({ data }: { data: Wrapped }) {
  const at = (day: string) => moment.utc(day).valueOf()
  const calls = data.days.map((d) => ({ x: at(d.day), y: d.contract_calls }))
  const active = data.days.map((d) => ({ x: at(d.day), y: d.contracts_called }))
  const failure = data.days.map((d) => ({
    x: at(d.day),
    y: (100 * d.failed_transactions) / Math.max(d.transactions, 1),
  }))
  const marker = (kind: string, label: string, series: { x: number; y: number }[]) => {
    const found = data.records.find((r) => r.kind === kind)
    const point = found && series.find((p) => p.x === at(found.day))
    return point ? [{ ...point, label }] : []
  }
  return (
    <>
      <SectionHeader index="01 · Activity" title="How busy the network was, day by day" />
      <Tile title="Three views of the same year" note="dots mark record days">
        <div className="sw-activity-panels">
          <p className="sw-activity-caption">Contract calls per day</p>
          <AreaTrend
            label="Contract calls"
            data={calls}
            axis={false}
            height={190}
            markers={[
              ...marker('most_calls', 'Busiest', calls),
              ...marker('quietest', 'Quietest', calls),
            ]}
          />
          <p className="sw-activity-caption">Different contracts called per day</p>
          <AreaTrend
            label="Contracts called"
            data={active}
            color="var(--chart-2)"
            axis={false}
            height={150}
          />
          <p className="sw-activity-caption">Share of all Stellar transactions that fail</p>
          <AreaTrend
            label="Failure rate"
            data={failure}
            color="var(--destructive)"
            format={(n) => `${n.toFixed(0)}%`}
            height={190}
            markers={[
              ...marker('highest_failure_rate', 'Worst', failure),
              ...marker('lowest_failure_rate', 'Best', failure),
            ]}
          />
        </div>
      </Tile>
    </>
  )
}
