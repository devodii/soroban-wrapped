import moment from 'moment'
import type { Wrapped } from '../../lib/api-schema'
import { Columns } from '../../charts/Columns/Columns'
import { HBars } from '../../charts/HBars/HBars'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Tile } from '../../ui/Tile/Tile'
import './Anatomy.scss'

export function Anatomy({ data }: { data: Wrapped }) {
  const w = data.wasm
  const busiest = data.weekdays.reduce((a, b) => (b.contract_calls > a.contract_calls ? b : a))
  return (
    <>
      <SectionHeader index="03 · Anatomy" title="When it runs and what it is built with" />
      <div className="sw-anatomy-grid">
        <Tile title="Average calls by weekday" note="finished days only">
          <Columns
            label="Average contract calls"
            highlight={moment().isoWeekday(busiest.weekday).format('ddd')}
            data={data.weekdays.map((d) => ({
              label: moment().isoWeekday(d.weekday).format('ddd'),
              value: d.contract_calls,
              note: `${d.failure_percent.toFixed(1)}% of transactions fail`,
            }))}
          />
        </Tile>
        <Tile title="SDK versions" note="contracts looked up on the RPC">
          <HBars
            label="Contracts by SDK version"
            labelWidth={96}
            color="var(--chart-3)"
            format={(n) => n.toLocaleString('en')}
            rows={data.sdk_versions.slice(0, 6).map((s) => ({
              id: s.version,
              label: s.version === 'unknown' ? 'not recorded' : s.version,
              value: s.contracts,
            }))}
          />
        </Tile>
        <Tile
          title="Contract size in KB"
          note={`${w.live.toLocaleString('en')} live · ${w.expired.toLocaleString('en')} expired · avg ${((w.average_wasm ?? 0) / 1024).toFixed(0)} KB`}
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
      </div>
    </>
  )
}
