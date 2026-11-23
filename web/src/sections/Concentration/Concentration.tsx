import type { Wrapped } from '../../lib/api-schema'
import { Figure } from '../../ui/Figure/Figure'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Tile } from '../../ui/Tile/Tile'
import './Concentration.scss'

const CELLS = 100

export function Concentration({ data }: { data: Wrapped }) {
  const c = data.concentration
  const share = (calls: number) => (100 * calls) / c.total_calls
  const top1 = share(c.top_1)
  const top10 = share(c.top_10)
  const top100 = share(c.top_100)
  const cells = Array.from({ length: CELLS }, (_, i) =>
    i < Math.round(top1)
      ? 'one'
      : i < Math.round(top10)
        ? 'ten'
        : i < Math.round(top100)
          ? 'hundred'
          : 'rest',
  )
  return (
    <>
      <SectionHeader index="02 · Concentration" title="A handful of contracts run the show">
        Each square below is one percent of every contract call this year, coloured by the contract
        that made it.
      </SectionHeader>
      <div className="sw-concentration-grid">
        <Tile title="One hundred squares" note={`${c.total_calls.toLocaleString('en')} calls`}>
          <div
            className="sw-concentration-cells"
            role="img"
            aria-label="Share of calls by contract rank"
          >
            {cells.map((kind, i) => (
              <span key={i} className={`sw-concentration-cell sw-concentration-${kind}`} />
            ))}
          </div>
          <ul className="sw-concentration-legend">
            <li>
              <i className="sw-concentration-one" /> The busiest contract <b>{top1.toFixed(1)}%</b>
            </li>
            <li>
              <i className="sw-concentration-ten" /> Next nine <b>{(top10 - top1).toFixed(1)}%</b>
            </li>
            <li>
              <i className="sw-concentration-hundred" /> Next ninety{' '}
              <b>{(top100 - top10).toFixed(1)}%</b>
            </li>
            <li>
              <i className="sw-concentration-rest" /> Everyone else{' '}
              <b>{(100 - top100).toFixed(1)}%</b>
            </li>
          </ul>
        </Tile>
        <div className="sw-concentration-facts">
          <Tile title="To reach half of all calls">
            <Figure value={c.contracts_for_half} className="sw-concentration-big" />
            <p>
              {c.contracts_for_half === 1 ? 'contract' : 'contracts'}. Ninety percent takes{' '}
              {c.contracts_for_ninety}.
            </p>
          </Tile>
          <Tile title="Seen on one day only">
            <Figure value={c.one_day_contracts} className="sw-concentration-big" />
            <p>
              of {c.contracts.toLocaleString('en')} contracts were called on a single day, and{' '}
              {c.under_ten_calls.toLocaleString('en')} were called fewer than ten times.
            </p>
          </Tile>
        </div>
      </div>
    </>
  )
}
