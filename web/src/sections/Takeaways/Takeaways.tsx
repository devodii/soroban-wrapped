import * as React from 'react'
import moment from 'moment'
import type { Wrapped } from '../../lib/api-schema'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Tile } from '../../ui/Tile/Tile'
import './Takeaways.scss'

export function Takeaways({ data }: { data: Wrapped }) {
  const {
    totals,
    concentration: c,
    graph_totals: g,
    records,
    months,
    weekdays,
    top_contracts,
  } = data
  const failed = (100 * totals.failed_transactions) / totals.transactions
  const worst = records.find((r) => r.kind === 'highest_failure_rate')
  const full = months.slice(0, -1)
  const first = full[0]
  const peak = full.reduce((a, b) => (b.contract_calls > a.contract_calls ? b : a), full[0]!)
  const biggest = months.slice(1).reduce((a, b) => (b.new_contracts > a.new_contracts ? b : a))
  const typical = months.slice(1).filter((m) => m !== biggest)
  const typicalNew =
    typical.reduce((sum, m) => sum + m.new_contracts, 0) / Math.max(typical.length, 1)
  const weekday = weekdays.filter((d) => d.weekday <= 5)
  const weekend = weekdays.filter((d) => d.weekday > 5)
  const mean = (days: typeof weekdays) =>
    days.reduce((s, d) => s + d.contract_calls, 0) / Math.max(days.length, 1)
  const lead = top_contracts[0]
  const items: React.ReactNode[] = [
    <>
      <b>
        {lead?.name ?? 'One contract'} made {((100 * c.top_1) / c.total_calls).toFixed(0)}% of all
        calls.
      </b>{' '}
      {c.contracts_for_ninety} contracts made 90%.
    </>,
    <>
      <b>{((100 * g.calls) / totals.contract_calls).toFixed(0)}% of calls</b> were contracts calling
      other contracts, not people.
    </>,
    <>
      <b>{failed.toFixed(0)}% of transactions fail</b>
      {worst &&
        `, peaking at ${worst.value.toFixed(0)}% on ${moment.utc(worst.day).format('MMM D')}`}
      .
    </>,
    first && (
      <>
        Monthly calls grew <b>{(peak.contract_calls / first.contract_calls).toFixed(1)}×</b> from{' '}
        {moment.utc(first.month).format('MMMM')} to {moment.utc(peak.month).format('MMMM')}.
      </>
    ),
    <>
      <b>{((100 * c.one_day_contracts) / c.contracts).toFixed(0)}% of contracts</b> were called on a
      single day only.
    </>,
    <>
      <b>
        {moment.utc(biggest.month).format('MMMM')} added{' '}
        {biggest.new_contracts.toLocaleString('en')} new contracts
      </b>
      , {(biggest.new_contracts / Math.max(typicalNew, 1)).toFixed(0)}× a typical month.
    </>,
    <>
      <b>Weekends are as busy as weekdays</b> ({((100 * mean(weekend)) / mean(weekday)).toFixed(0)}%
      of the weekday average), so most traffic is machines, not people.
    </>,
  ]
  return (
    <>
      <SectionHeader index="03 · Takeaways" title="What stands out" />
      <Tile title="In short">
        <ol className="sw-takeaways">
          {items.filter(Boolean).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </Tile>
    </>
  )
}
