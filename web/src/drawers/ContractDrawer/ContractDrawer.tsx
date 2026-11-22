import moment from 'moment'
import { Crosshair } from 'lucide-react'
import { LineChart } from '../../charts/LineChart/LineChart'
import { useContract } from '../../lib/queries'
import { Button } from '../../ui/Button/Button'
import { CopyButton } from '../../ui/CopyButton/CopyButton'
import { Drawer } from '../../ui/Drawer/Drawer'
import { ErrorState } from '../../ui/ErrorState/ErrorState'
import { Section } from '../../ui/Section/Section'
import { Skeleton } from '../../ui/Skeleton/Skeleton'
import { Stat } from '../../ui/Stat/Stat'
import { Tag } from '../../ui/Tag/Tag'
import '../ProposalDrawer/ProposalDrawer.scss'
import './ContractDrawer.scss'

export function ContractDrawer({
  keyId,
  onClose,
  onGraph,
  onRepo,
}: {
  keyId: string | null
  onClose: () => void
  onGraph: (id: string) => void
  onRepo: (fullName: string) => void
}) {
  const query = useContract(keyId)
  const c = query.data
  return (
    <Drawer
      open={!!keyId}
      onClose={onClose}
      eyebrow={c ? `Contract · ${c.network}` : 'Contract'}
      title={c ? `${c.contract_id.slice(0, 8)}…${c.contract_id.slice(-6)}` : (keyId ?? '')}
      footer={
        c && (
          <>
            <Button variant="primary" onClick={() => onGraph(`${c.network}:${c.contract_id}`)}>
              <Crosshair size={14} />
              Show in graph
            </Button>
            <CopyButton text={c.contract_id} label="Copy id" />
          </>
        )
      }
    >
      {query.isPending && <Skeleton height="12rem" />}
      {query.error && <ErrorState error={query.error} retry={() => query.refetch()} />}
      {c && (
        <>
          <div className="sw-proposaldrawer-tags">
            <Tag tone={c.network === 'mainnet' ? 'primary' : 'secondary'}>{c.network}</Tag>
            {c.live ? <Tag tone="ok">live</Tag> : <Tag>not live</Tag>}
            {c.sdk_version && <Tag>sdk {c.sdk_version}</Tag>}
            {c.wasm_size != null && <Tag>{(c.wasm_size / 1024).toFixed(1)} KB wasm</Tag>}
          </div>
          <div className="sw-proposaldrawer-stats">
            <Stat label="Calls in 2026" value={c.invocations.toLocaleString('en')} />
            <Stat
              label="Active days"
              value={c.days.length}
              hint={
                c.days.length
                  ? `last ${moment.utc(c.days[c.days.length - 1]!.day).format('MMM D')}`
                  : undefined
              }
            />
          </div>
          {c.days.length > 1 && (
            <Section title="Calls per day">
              <LineChart
                label="Calls per day"
                data={c.days.map((d) => ({
                  x: moment.utc(d.day).valueOf(),
                  calls: d.invocations,
                  callers: d.callers,
                }))}
                series={[
                  {
                    id: 'calls',
                    label: 'Calls',
                    color: c.network === 'mainnet' ? 'var(--net-mainnet)' : 'var(--net-testnet)',
                  },
                  { id: 'callers', label: 'Callers', color: 'var(--chart-5)' },
                ]}
              />
            </Section>
          )}
          {c.function_names.length > 0 && (
            <Section title={`Functions (${c.function_names.length})`}>
              <div className="sw-proposaldrawer-tags">
                {c.function_names.slice(0, 24).map((f) => (
                  <Tag key={f}>{f}</Tag>
                ))}
              </div>
            </Section>
          )}
          {c.repos.length > 0 && (
            <Section title="Repos that reference it">
              <ul className="sw-proposaldrawer-list">
                {c.repos.map((r) => (
                  <li key={r.full_name}>
                    <button type="button" onClick={() => onRepo(r.full_name)}>
                      {r.full_name}
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          <code className="sw-contractdrawer-id">{c.contract_id}</code>
        </>
      )}
    </Drawer>
  )
}
