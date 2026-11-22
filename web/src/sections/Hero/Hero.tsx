import moment from 'moment'
import type { Wrapped } from '../../lib/api-schema'
import { Backdrop } from '../../ui/Backdrop/Backdrop'
import { Figure } from '../../ui/Figure/Figure'
import { Tile } from '../../ui/Tile/Tile'
import './Hero.scss'

export function Hero({ data }: { data: Wrapped }) {
  const window =
    data.first_day && data.last_day
      ? `${moment.utc(data.first_day).format('MMM D')} to ${moment.utc(data.last_day).format('MMM D, YYYY')}`
      : '2026'
  return (
    <section className="sw-hero" id="top">
      <Backdrop />
      <div className="sw-hero-inner">
        <p className="sw-hero-eyebrow">What Soroban developers write by hand · {window}</p>
        <h1 className="sw-hero-title">
          Soroban <em>Wrapped</em>
        </h1>
        <p className="sw-hero-lede">
          We read every public Soroban repo and the chain itself, to find the code everyone
          rewrites, the tooling nobody has built yet, and how the contracts really talk to each
          other.
        </p>
        <div className="sw-hero-grid">
          <Tile
            title="The field"
            note={`${data.stellar_repos.toLocaleString('en')} more Stellar repos read`}
          >
            <div className="sw-hero-big">
              <Figure value={data.soroban_repos} className="sw-hero-figure" />
              <p>
                Soroban repos
                <br />
                in the window
              </p>
            </div>
            <dl className="sw-hero-stats">
              <div>
                <dt>on mainnet</dt>
                <dd>
                  <Figure value={data.mainnet_repos} />
                </dd>
              </div>
              <div>
                <dt>on testnet</dt>
                <dd>
                  <Figure value={data.testnet_repos} />
                </dd>
              </div>
              <div>
                <dt>commits read</dt>
                <dd>
                  <Figure
                    value={data.commits}
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
          <Tile title="On chain" note="contracts found in those repos">
            <div className="sw-hero-pair">
              <div>
                <span className="sw-hero-dot sw-hero-mainnet" />
                <Figure value={data.mainnet_contracts} className="sw-hero-figure sw-hero-medium" />
                <p>mainnet</p>
              </div>
              <div>
                <span className="sw-hero-dot sw-hero-testnet" />
                <Figure value={data.testnet_contracts} className="sw-hero-figure sw-hero-medium" />
                <p>testnet</p>
              </div>
            </div>
            <p className="sw-hero-foot">
              <b>{data.live_contracts.toLocaleString('en')}</b> are live right now.
            </p>
          </Tile>
          <Tile title="Hand written" note="parsed and matched">
            <div className="sw-hero-big">
              <Figure value={data.functions} className="sw-hero-figure sw-hero-medium" />
              <p>functions parsed</p>
            </div>
            <dl className="sw-hero-stats">
              <div>
                <dt>patterns</dt>
                <dd>
                  <Figure value={data.patterns} />
                </dd>
              </div>
              <div>
                <dt>proposals</dt>
                <dd>
                  <Figure value={data.proposals} />
                </dd>
              </div>
              <div>
                <dt>tooling needs</dt>
                <dd>
                  <Figure value={data.needs} />
                </dd>
              </div>
            </dl>
          </Tile>
        </div>
      </div>
    </section>
  )
}
