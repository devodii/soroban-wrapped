import moment from 'moment'
import type { Wrapped } from '../../lib/api-schema'
import { Backdrop } from '../../ui/Backdrop/Backdrop'
import { Figure } from '../../ui/Figure/Figure'
import { Tile } from '../../ui/Tile/Tile'
import './Hero.scss'

const compact = (n: number) =>
  n.toLocaleString('en', { notation: 'compact', maximumFractionDigits: 2 })

export function Hero({ data }: { data: Wrapped }) {
  const { totals } = data
  const failed = (100 * totals.failed_transactions) / totals.transactions
  const kpis = [
    { label: 'Contract calls', value: totals.contract_calls, format: compact },
    { label: 'Transactions', value: totals.transactions, format: compact },
    { label: 'Contracts called', value: totals.contracts_called, format: compact },
    { label: 'Failed transactions', value: failed, format: (n: number) => `${n.toFixed(1)}%` },
  ]
  return (
    <section className="sw-hero" id="top">
      <Backdrop />
      <div className="sw-hero-inner">
        <p className="sw-hero-eyebrow">
          {data.network} · {moment.utc(totals.first_day).format('MMM D')} to{' '}
          {moment.utc(totals.last_day).format('MMM D, YYYY')} ·{' '}
          {totals.has_partial_day ? 'includes today so far · ' : ''}synced{' '}
          {totals.synced_at ? moment.utc(totals.synced_at).fromNow() : 'never'}
        </p>
        <h1 className="sw-hero-title">
          Soroban <em>Wrapped</em>
        </h1>
        <div className="sw-hero-kpis">
          {kpis.map((k) => (
            <Tile key={k.label} title={k.label}>
              <Figure value={k.value} format={k.format} className="sw-hero-figure" />
            </Tile>
          ))}
        </div>
      </div>
    </section>
  )
}
