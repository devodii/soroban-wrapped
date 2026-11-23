import * as React from 'react'
import type { Wrapped } from '../../lib/api-schema'
import { ContractId } from '../../ui/ContractId/ContractId'
import { Figure } from '../../ui/Figure/Figure'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Skeleton } from '../../ui/Skeleton/Skeleton'
import { Tile } from '../../ui/Tile/Tile'
import './Composability.scss'

const ContractGraph = React.lazy(() => import('../../graph/ContractGraph/ContractGraph'))

const compact = (n: number) =>
  n.toLocaleString('en', { notation: 'compact', maximumFractionDigits: 1 })

export function Composability({ data }: { data: Wrapped }) {
  const g = data.graph_totals
  const callees = data.hubs.filter((h) => h.role === 'callee').slice(0, 5)
  const callers = data.hubs.filter((h) => h.role === 'caller').slice(0, 5)
  return (
    <>
      <SectionHeader index="05 · Graph" title="Contracts calling contracts">
        {compact(g.calls)} calls did not come from a person. A contract called another contract.
        Each dot below is one of the {data.graph.nodes.length} most connected contracts.
      </SectionHeader>
      <div className="sw-composability-stats">
        <Tile title="Different pairs">
          <Figure value={g.pairs} format={compact} className="sw-composability-big" />
          <p>contract-to-contract relationships</p>
        </Tile>
        <Tile title="Callers">
          <Figure value={g.callers} format={compact} className="sw-composability-big" />
          <p>contracts that call another contract</p>
        </Tile>
        <Tile title="Callees">
          <Figure value={g.callees} format={compact} className="sw-composability-big" />
          <p>contracts that are called by another</p>
        </Tile>
      </div>
      <React.Suspense fallback={<Skeleton width="100%" height="40rem" />}>
        <ContractGraph graph={data.graph} />
      </React.Suspense>
      <div className="sw-composability-hubs">
        <Tile title="Most called by others" note="distinct callers">
          <ul>
            {callees.map((h) => (
              <li key={h.contract_id}>
                <ContractId id={h.contract_id} />
                <span>{h.partners.toLocaleString('en')} callers</span>
              </li>
            ))}
          </ul>
        </Tile>
        <Tile title="Calls the most others" note="distinct contracts">
          <ul>
            {callers.map((h) => (
              <li key={h.contract_id}>
                <ContractId id={h.contract_id} />
                <span>{h.partners.toLocaleString('en')} contracts</span>
              </li>
            ))}
          </ul>
        </Tile>
      </div>
    </>
  )
}
