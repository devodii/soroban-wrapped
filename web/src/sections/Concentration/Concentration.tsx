import type { Wrapped } from '../../lib/api-schema'
import { HBars } from '../../charts/HBars/HBars'
import { Pareto } from '../../charts/Pareto/Pareto'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Tile } from '../../ui/Tile/Tile'
import './Concentration.scss'

const CALLOUTS = [1, 10, 1000]

export function Concentration({ data }: { data: Wrapped }) {
  const callouts = CALLOUTS.flatMap((contracts) => {
    const point = data.pareto.find((p) => p.contracts === contracts)
    return point
      ? [
          {
            contracts,
            label: `${contracts.toLocaleString('en')} ${contracts === 1 ? 'contract' : 'contracts'}: ${point.share.toFixed(0)}%`,
          },
        ]
      : []
  })
  return (
    <>
      <SectionHeader index="02 · Concentration" title="A few contracts carry the network" />
      <div className="sw-concentration-grid">
        <Tile title="Share of all calls" note="by number of busiest contracts, log scale">
          <Pareto
            label="Cumulative share of calls by contract rank"
            points={data.pareto}
            callouts={callouts}
          />
        </Tile>
        <Tile title="Top 10 contracts" note="calls this year, tagged by most called function">
          <HBars
            label="Top contracts by calls"
            labelWidth={170}
            rows={data.top_contracts.map((c) => ({
              id: c.contract_id,
              label: `${c.contract_id.slice(0, 4)}…${c.contract_id.slice(-4)} · ${c.top_function ?? '?'}`,
              value: c.invocations,
            }))}
          />
        </Tile>
      </div>
    </>
  )
}
