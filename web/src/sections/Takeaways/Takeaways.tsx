import * as React from 'react'
import moment from 'moment'
import type { Wrapped } from '../../lib/api-schema'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Tile } from '../../ui/Tile/Tile'
import './Takeaways.scss'

export function Takeaways({ data }: { data: Wrapped }) {
  const { totals, concentration: c, graph_totals: g, records, months, weekdays } = data
  const top = data.top_contracts
  const failed = (100 * totals.failed_transactions) / totals.transactions
  const failedCalls = (100 * totals.failed_calls) / totals.contract_calls
  const monthlyFailure = months.map((m) => (100 * m.failed_transactions) / m.transactions)
  const worst = records.find((r) => r.kind === 'highest_failure_rate')
  const full = data.split.slice(0, -1)
  const firstSplit = full[0]
  const peakSplit = full.reduce((a, b) => (b.others > a.others ? b : a), full[0]!)
  const giantShare = (100 * c.top_1) / c.total_calls
  const insideGiants = (100 * g.giant_calls) / g.calls
  const withoutGiants = (100 * (g.calls - g.giant_calls)) / totals.contract_calls
  const biggest = months.slice(1).reduce((a, b) => (b.new_contracts > a.new_contracts ? b : a))
  const cohort = data.cohorts.find((x) => x.month === biggest.month)
  const weekday = weekdays.filter((d) => d.weekday <= 5)
  const weekend = weekdays.filter((d) => d.weekday > 5)
  const mean = (days: typeof weekdays) =>
    days.reduce((sum, d) => sum + d.contract_calls, 0) / Math.max(days.length, 1)
  const heavy = top.filter((t) => t.invocations >= 1_000_000)
  const leakiest = heavy.reduce(
    (a, b) =>
      (b.invocations - b.successful) / b.invocations >
      (a.invocations - a.successful) / a.invocations
        ? b
        : a,
    heavy[0]!,
  )
  const label = (t: (typeof top)[number]) =>
    t.name ? (
      <>
        {t.name} (<code className="sw-takeaways-id">{t.contract_id}</code>)
      </>
    ) : (
      <>
        <code className="sw-takeaways-id">{t.contract_id}</code> ({t.top_function ?? '?'})
      </>
    )
  const items: React.ReactNode[] = [
    <>
      <b>
        {top[0] ? label(top[0]) : 'One contract'} made {giantShare.toFixed(0)}% of all calls.
      </b>{' '}
      {c.contracts_for_ninety} contracts made 90%.
    </>,
    <>
      <b>
        {((100 * g.calls) / totals.contract_calls).toFixed(0)}% of calls were contracts calling
        contracts
      </b>
      , but {insideGiants.toFixed(0)}% of those involve the top {data.giants} contracts. Everything
      else is just {withoutGiants.toFixed(1)}% of all calls.
    </>,
    firstSplit && (
      <>
        Without the top {data.giants}, monthly calls grew{' '}
        <b>{(peakSplit.others / firstSplit.others).toFixed(1)}×</b> from{' '}
        {moment.utc(firstSplit.month).format('MMMM')} to{' '}
        {moment.utc(peakSplit.month).format('MMMM')}.
      </>
    ),
    <>
      <b>
        The median contract was called {data.funnel.median_calls.toLocaleString('en')} times, ever.
      </b>{' '}
      Only {data.funnel.over_thousand_calls.toLocaleString('en')} (
      {((100 * data.funnel.over_thousand_calls) / data.funnel.contracts).toFixed(1)}%) passed 1,000,
      and {data.funnel.active_half_a_year.toLocaleString('en')} stayed active for six months.
    </>,
    <>
      <b>{failed.toFixed(0)}% of all Stellar transactions fail</b> (
      {Math.min(...monthlyFailure).toFixed(0)}% to {Math.max(...monthlyFailure).toFixed(0)}% by
      month
      {worst && `, ${worst.value.toFixed(0)}% on ${moment.utc(worst.day).format('MMM D')}`}), yet
      only {failedCalls.toFixed(1)}% of contract calls do. Most failures never reach a contract
      call.
    </>,
    leakiest && (
      <>
        <b>
          {((100 * (leakiest.invocations - leakiest.successful)) / leakiest.invocations).toFixed(0)}
          % of {label(leakiest)} calls fail
        </b>
        , the least reliable of the busiest contracts.
      </>
    ),
    cohort && (
      <>
        <b>
          {moment.utc(biggest.month).format('MMMM')} added{' '}
          {biggest.new_contracts.toLocaleString('en')} contracts
        </b>
        , the most of any month. {((100 * cohort.active) / cohort.contracts).toFixed(0)}% are still
        called today.
      </>
    ),
    <>
      <b>{((100 * c.one_day_contracts) / c.contracts).toFixed(0)}% of contracts</b> were called on a
      single day only.
    </>,
    <>
      <b>Weekends are as busy as weekdays</b> ({((100 * mean(weekend)) / mean(weekday)).toFixed(0)}%
      of the weekday average). Most traffic is machines.
    </>,
  ]
  return (
    <>
      <SectionHeader index="04 · Takeaways" title="What stands out" />
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
