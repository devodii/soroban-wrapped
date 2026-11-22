import moment from 'moment'
import { Crosshair, ExternalLink } from 'lucide-react'
import { useRepo } from '../../lib/queries'
import { Comments } from '../../comments/Comments/Comments'
import { Button } from '../../ui/Button/Button'
import { CodeBlock } from '../../ui/CodeBlock/CodeBlock'
import { Drawer } from '../../ui/Drawer/Drawer'
import { ErrorState } from '../../ui/ErrorState/ErrorState'
import { Section } from '../../ui/Section/Section'
import { Skeleton } from '../../ui/Skeleton/Skeleton'
import { Stat } from '../../ui/Stat/Stat'
import { Tag } from '../../ui/Tag/Tag'
import '../ProposalDrawer/ProposalDrawer.scss'

export function RepoDrawer({
  fullName,
  onClose,
  onGraph,
  onProposal,
  onNeed,
  onContract,
}: {
  fullName: string | null
  onClose: () => void
  onGraph: (id: string) => void
  onProposal: (id: string) => void
  onNeed: (id: string) => void
  onContract: (key: string) => void
}) {
  const query = useRepo(fullName)
  const r = query.data
  return (
    <Drawer
      open={!!fullName}
      onClose={onClose}
      eyebrow={r ? (r.is_soroban ? 'Soroban repo' : 'Stellar repo') : 'Repo'}
      title={fullName ?? ''}
      footer={
        r && (
          <>
            {r.is_soroban && (
              <Button variant="primary" onClick={() => onGraph(r.full_name)}>
                <Crosshair size={14} />
                Show in graph
              </Button>
            )}
            <a href={r.url} target="_blank" rel="noreferrer">
              <Button>
                <ExternalLink size={14} />
                GitHub
              </Button>
            </a>
          </>
        )
      }
    >
      {query.isPending && <Skeleton height="12rem" />}
      {query.error && <ErrorState error={query.error} retry={() => query.refetch()} />}
      {r && (
        <>
          {r.description && <p>{r.description}</p>}
          <div className="sw-proposaldrawer-tags">
            {r.networks.map((n) => (
              <Tag key={n} tone={n === 'mainnet' ? 'primary' : 'secondary'}>
                {n}
              </Tag>
            ))}
            {r.language && <Tag>{r.language}</Tag>}
            {r.license && <Tag>{r.license}</Tag>}
            {r.archived && <Tag tone="warn">archived</Tag>}
            {r.pushed_at && <Tag>pushed {moment(r.pushed_at).fromNow()}</Tag>}
            {r.stack.slice(0, 4).map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
          <div className="sw-proposaldrawer-stats">
            <Stat label="Stars" value={r.stars.toLocaleString('en')} />
            <Stat
              label="Rust lines"
              value={r.rust_loc.toLocaleString('en')}
              hint={`${r.contract_crates} contract crates`}
            />
            <Stat label="Commits in window" value={(r.window_commits ?? 0).toLocaleString('en')} />
            <Stat label="Proposals it hand rolls" value={r.proposals.length} />
          </div>
          {r.proposals.length > 0 && (
            <Section title="Writes by hand">
              <ul className="sw-proposaldrawer-list">
                {r.proposals.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => onProposal(p.id)}>
                      {p.name}
                    </button>
                    <small>score {p.score.toFixed(1)}</small>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {r.patterns.slice(0, 3).map((p) => (
            <Section key={p.id} title={`${p.id} · ${p.occurrences}x`}>
              {p.sample && <CodeBlock code={p.sample} caption={p.sample_path ?? p.id} />}
            </Section>
          ))}
          {r.contracts.length > 0 && (
            <Section title="Contracts linked to it">
              <ul className="sw-proposaldrawer-list">
                {r.contracts.slice(0, 10).map((c) => (
                  <li key={`${c.network}${c.contract_id}`}>
                    <button
                      type="button"
                      onClick={() => onContract(`${c.network}/${c.contract_id}`)}
                    >
                      <code>{c.contract_id.slice(0, 8)}</code>
                    </button>
                    <Tag tone={c.network === 'mainnet' ? 'primary' : 'secondary'}>{c.network}</Tag>
                    <Tag>{c.link}</Tag>
                    {c.live && <Tag tone="ok">live</Tag>}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {r.needs.length > 0 && (
            <Section title="Shows up as evidence for">
              <ul className="sw-proposaldrawer-list">
                {r.needs.map((n) => (
                  <li key={n.id}>
                    <button type="button" onClick={() => onNeed(n.id)}>
                      {n.title}
                    </button>
                    <small>{n.evidence} items</small>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          <Section title="Notes">
            <Comments kind="repo" id={r.full_name} />
          </Section>
        </>
      )}
    </Drawer>
  )
}
