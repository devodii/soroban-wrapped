import moment from 'moment'
import type { Wrapped } from '../../lib/api-schema'
import { Backdrop } from '../../ui/Backdrop/Backdrop'
import { Figure } from '../../ui/Figure/Figure'
import { Tile } from '../../ui/Tile/Tile'
import './Summary.scss'

const compact = (n: number) =>
  n.toLocaleString('en', { notation: 'compact', maximumFractionDigits: 2 })

export function Summary({ data }: { data: Wrapped }) {
  const { totals, concentration: c, graph_totals: g, records, months } = data
  const failed = (100 * totals.failed_transactions) / totals.transactions
  const worst = records.find((r) => r.kind === 'highest_failure_rate')
  const full = months.slice(0, -1)
  const first = full[0]
  const peak = full.reduce((a, b) => (b.contract_calls > a.contract_calls ? b : a), full[0]!)
  const kpis = [
    { label: 'Contract calls', value: totals.contract_calls, format: compact },
    { label: 'Transactions', value: totals.transactions, format: compact },
    { label: 'Contracts called', value: totals.contracts_called, format: compact },
    { label: 'Failed transactions', value: failed, format: (n: number) => `${n.toFixed(1)}%` },
  ]
  const findings = [
    <>
      <b>One contract made {((100 * c.top_1) / c.total_calls).toFixed(0)}%</b> of all calls.{' '}
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
  ]
  return (
    <section className="sw-summary" id="top">
      <Backdrop />
      <div className="sw-summary-inner">
        <p className="sw-summary-eyebrow">
          {data.network} · {moment.utc(totals.first_day).format('MMM D')} to{' '}
          {moment.utc(totals.last_day).format('MMM D, YYYY')} ·{' '}
          {totals.has_partial_day ? 'includes today so far · ' : ''}synced{' '}
          {totals.synced_at ? moment.utc(totals.synced_at).fromNow() : 'never'}
        </p>
        <h1 className="sw-summary-title">
          Soroban <em>Wrapped</em>
        </h1>
        <div className="sw-summary-kpis">
          {kpis.map((k) => (
            <Tile key={k.label} title={k.label}>
              <Figure value={k.value} format={k.format} className="sw-summary-figure" />
            </Tile>
          ))}
        </div>
        <Tile title="Executive summary">
          <ol className="sw-summary-findings">
            {findings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ol>
        </Tile>
      </div>
    </section>
  )
}
