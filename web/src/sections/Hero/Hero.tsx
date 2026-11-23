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
  return (
    <section className="sw-hero" id="top">
      <Backdrop />
      <div className="sw-hero-inner">
        <p className="sw-hero-eyebrow">
          {data.network} · {moment.utc(totals.first_day).format('MMM D')} to{' '}
          {moment.utc(totals.last_day).format('MMM D, YYYY')} · {totals.days} days
        </p>
        <h1 className="sw-hero-title">
          Soroban <em>Wrapped</em>
        </h1>
        <p className="sw-hero-lede">
          Every ledger of {moment.utc(totals.last_day).format('YYYY')}, read from the public
          archive. Here is what the network really did.
        </p>
        <div className="sw-hero-grid">
          <Tile title="Contract calls" note="calls to Soroban contracts">
            <div className="sw-hero-big">
              <Figure value={totals.contract_calls} format={compact} className="sw-hero-figure" />
            </div>
            <p className="sw-hero-foot">
              across <b>{totals.contracts_called.toLocaleString('en')}</b> different contracts.
            </p>
          </Tile>
          <Tile title="Transactions" note={`${totals.ledgers.toLocaleString('en')} ledgers`}>
            <div className="sw-hero-big">
              <Figure value={totals.transactions} format={compact} className="sw-hero-figure" />
            </div>
            <p className="sw-hero-foot">
              carrying <b>{compact(totals.operations)}</b> operations.
            </p>
          </Tile>
          <Tile title="Failed" note="transactions that reverted">
            <div className="sw-hero-big">
              <Figure
                value={failed}
                format={(n) => `${n.toFixed(1)}%`}
                className="sw-hero-figure"
              />
            </div>
            <p className="sw-hero-foot">
              <b>{compact(totals.failed_transactions)}</b> transactions did not go through.
            </p>
          </Tile>
        </div>
        <p className="sw-hero-updated">
          {totals.has_partial_day ? 'Includes today so far. ' : ''}
          Last synced {totals.synced_at ? moment.utc(totals.synced_at).fromNow() : 'never'}.
        </p>
      </div>
    </section>
  )
}
