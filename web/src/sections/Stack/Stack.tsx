import type { Wrapped } from '../../lib/api-schema'
import { Bars } from '../../ui/Bars/Bars'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Stat } from '../../ui/Stat/Stat'
import { Tile } from '../../ui/Tile/Tile'
import './Stack.scss'

const compact = (n: number) =>
  n.toLocaleString('en', { notation: 'compact', maximumFractionDigits: 1 })

export function Stack({ data }: { data: Wrapped }) {
  const w = data.wasm
  return (
    <>
      <SectionHeader index="06 · Stack" title="What the contracts are made of">
        The functions people call, the SDK versions that run the most traffic, and the contract code
        deployed again and again.
      </SectionHeader>
      <div className="sw-stack-grid">
        <Tile title="Most called functions" note="calls across all contracts">
          <Bars
            tone="teal"
            format={compact}
            rows={data.functions.map((f) => ({
              id: f.name,
              label: f.name,
              value: f.calls,
              hint: `${f.contracts.toLocaleString('en')} ${f.contracts === 1 ? 'contract' : 'contracts'}`,
            }))}
          />
        </Tile>
        <Tile title="SDK versions" note="contracts we looked up">
          <Bars
            tone="secondary"
            rows={data.sdk_versions.map((s) => ({
              id: s.version,
              label: s.version === 'unknown' ? 'No version in the wasm' : s.version,
              value: s.contracts,
              hint: `${compact(s.invocations)} calls`,
            }))}
          />
        </Tile>
        <Tile title="Looked up on the RPC" note={`${w.contracts.toLocaleString('en')} contracts`}>
          <div className="sw-stack-stats">
            <Stat label="Live now" value={w.live.toLocaleString('en')} />
            <Stat label="Expired" value={w.expired.toLocaleString('en')} />
            <Stat label="Different wasm" value={w.wasm_modules.toLocaleString('en')} />
            <Stat label="Most functions" value={w.most_functions ?? 0} />
            <Stat label="Largest" value={`${((w.largest_wasm ?? 0) / 1024).toFixed(0)} KB`} />
            <Stat label="Average" value={`${((w.average_wasm ?? 0) / 1024).toFixed(0)} KB`} />
          </div>
        </Tile>
        <Tile title="Deployed again and again" note="contracts sharing one wasm">
          <Bars
            format={(n) => `${n.toLocaleString('en')} contracts`}
            rows={data.clones.map((c) => ({
              id: c.wasm_hash,
              label: c.functions.slice(0, 4).join(' · ') || c.wasm_hash.slice(0, 10),
              value: c.contracts,
              hint: `${c.sdk_version ?? 'no sdk version'} · ${((c.size ?? 0) / 1024).toFixed(0)} KB`,
            }))}
          />
        </Tile>
      </div>
    </>
  )
}
