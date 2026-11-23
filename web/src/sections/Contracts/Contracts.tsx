import type { Wrapped } from '../../lib/api-schema'
import { Columns } from '../../charts/Columns/Columns'
import { HBars } from '../../charts/HBars/HBars'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Tile } from '../../ui/Tile/Tile'
import './Contracts.scss'

const MIN_CALLS = 1_000_000

export function Contracts({ data }: { data: Wrapped }) {
  const { concentration: c, wasm: w } = data
  const share = (calls: number) => (100 * calls) / c.total_calls
  const top = data.top_contracts
  const rest = 100 - top.reduce((sum, t) => sum + share(t.invocations), 0)
  const rows = [
    ...top.map((t) => ({
      id: t.contract_id,
      label:
        t.name ??
        `${t.contract_id.slice(0, 4)}…${t.contract_id.slice(-4)} · ${t.top_function ?? '?'}`,
      value: share(t.invocations),
      href: t.registry_url,
    })),
    {
      id: 'rest',
      label: `Other ${(c.contracts - top.length).toLocaleString('en')} contracts`,
      value: rest,
    },
  ]
  const reliable = top
    .filter((t) => t.invocations >= MIN_CALLS)
    .map((t) => ({
      id: t.contract_id,
      label:
        t.name ??
        `${t.contract_id.slice(0, 4)}…${t.contract_id.slice(-4)} · ${t.top_function ?? '?'}`,
      value: (100 * (t.invocations - t.successful)) / t.invocations,
      href: t.registry_url,
    }))
    .sort((a, b) => b.value - a.value)
  return (
    <>
      <SectionHeader index="02 · Contracts" title="Who made the calls" />
      <div className="sw-contracts-grid">
        <Tile
          title="Share of all calls"
          note="named contracts link to the Stellar Registry"
          className="sw-contracts-tall"
        >
          <HBars
            label="Share of all contract calls"
            labelWidth={190}
            format={(n) => `${n.toFixed(n < 10 ? 1 : 0)}%`}
            rows={rows}
          />
        </Tile>
        <Tile
          title="Contract size in KB"
          note={`${w.live.toLocaleString('en')} live · ${w.expired.toLocaleString('en')} expired`}
        >
          <Columns
            label="Contracts by wasm size"
            color="var(--chart-4)"
            format={(n) => n.toLocaleString('en')}
            data={data.wasm_sizes.map((b) => ({
              label: `${b.from_kb}–${b.from_kb * 2}`,
              value: b.contracts,
              note: `contracts of ${b.from_kb} to ${b.from_kb * 2} KB`,
            }))}
          />
        </Tile>
        <Tile
          title="How often their calls fail"
          note={`busiest contracts with ${MIN_CALLS.toLocaleString('en')}+ calls`}
        >
          <HBars
            label="Share of each contract's calls that fail"
            labelWidth={190}
            color="var(--destructive)"
            format={(n) => `${n.toFixed(n < 10 ? 1 : 0)}%`}
            rows={reliable}
          />
        </Tile>
      </div>
    </>
  )
}
