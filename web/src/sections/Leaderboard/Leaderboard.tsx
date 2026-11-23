import moment from 'moment'
import type { Wrapped } from '../../lib/api-schema'
import { ContractId } from '../../ui/ContractId/ContractId'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Tile } from '../../ui/Tile/Tile'
import './Leaderboard.scss'

const compact = (n: number) =>
  n.toLocaleString('en', { notation: 'compact', maximumFractionDigits: 1 })

export function Leaderboard({ data }: { data: Wrapped }) {
  const top = data.top_contracts
  const max = Math.max(...top.map((c) => c.invocations), 1)
  return (
    <>
      <SectionHeader index="03 · Leaders" title="The busiest contracts">
        Ranked by total calls. The tag is the function each one is called for most.
      </SectionHeader>
      <Tile title={`Top ${top.length}`} note="calls this year">
        <ol className="sw-leaderboard">
          {top.map((c, index) => (
            <li key={c.contract_id} className="sw-leaderboard-row">
              <span className="sw-leaderboard-rank">{index + 1}</span>
              <div className="sw-leaderboard-main">
                <div className="sw-leaderboard-line">
                  <ContractId id={c.contract_id} />
                  {c.top_function && <span className="sw-leaderboard-tag">{c.top_function}</span>}
                  {c.live === false && (
                    <span className="sw-leaderboard-tag sw-leaderboard-gone">expired</span>
                  )}
                </div>
                <div className="sw-leaderboard-track">
                  <div
                    className="sw-leaderboard-fill"
                    style={{ width: `${(100 * c.invocations) / max}%` }}
                  />
                </div>
                <div className="sw-leaderboard-meta">
                  active {c.active_days} days · peak {moment.utc(c.peak_day).format('MMM D')} with{' '}
                  {compact(c.peak_invocations)} calls · up to{' '}
                  {c.peak_daily_accounts.toLocaleString('en')} accounts a day
                </div>
              </div>
              <span className="sw-leaderboard-value">{compact(c.invocations)}</span>
            </li>
          ))}
        </ol>
      </Tile>
    </>
  )
}
