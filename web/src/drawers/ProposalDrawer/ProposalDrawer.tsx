import moment from 'moment'
import { Crosshair } from 'lucide-react'
import { useProposal, useProposalContracts } from '../../lib/queries'
import { Comments } from '../../comments/Comments/Comments'
import { Button } from '../../ui/Button/Button'
import { CodeBlock } from '../../ui/CodeBlock/CodeBlock'
import { Drawer } from '../../ui/Drawer/Drawer'
import { ErrorState } from '../../ui/ErrorState/ErrorState'
import { ScoreBar } from '../../ui/ScoreBar/ScoreBar'
import { Section } from '../../ui/Section/Section'
import { Skeleton } from '../../ui/Skeleton/Skeleton'
import { Stat } from '../../ui/Stat/Stat'
import { Tag } from '../../ui/Tag/Tag'
import './ProposalDrawer.scss'

const EXPLAIN: Record<string, string> = {
  owners: 'Distinct owners who wrote this, not repos, so forks and copies do not count twice.',
  independence:
    'Share of the code that differs per owner. High means people really wrote it themselves.',
  mainnet: 'Share of adopting repos confirmed on mainnet.',
  recency: 'How much of the usage is recent.',
  fixes: 'Fix commits and bug issues tied to the pattern.',
  loc: 'Lines a macro would remove per adopter.',
  covered: 'Already covered by an existing library, which lowers the score.',
}

export function ProposalDrawer({
  id,
  onClose,
  onGraph,
  onRepo,
  onContract,
}: {
  id: string | null
  onClose: () => void
  onGraph: (id: string) => void
  onRepo: (fullName: string) => void
  onContract: (key: string) => void
}) {
  const query = useProposal(id)
  const contracts = useProposalContracts(id)
  const p = query.data
  return (
    <Drawer
      open={!!id}
      onClose={onClose}
      eyebrow={p ? `Proposal · ${p.kind}` : 'Proposal'}
      title={p?.name ?? 'Loading'}
      footer={
        p && (
          <Button variant="primary" onClick={() => onGraph(p.id)}>
            <Crosshair size={14} />
            Show in graph
          </Button>
        )
      }
    >
      {query.isPending && <Skeleton height="12rem" />}
      {query.error && <ErrorState error={query.error} retry={() => query.refetch()} />}
      {p && (
        <>
          <p>{p.summary}</p>
          <div className="sw-proposaldrawer-tags">
            <Tag tone={p.origin === 'mined' ? 'primary' : 'neutral'}>{p.origin}</Tag>
            <Tag>{p.status}</Tag>
            {p.covered_by.map((c) => (
              <Tag key={c} tone="warn">
                covered by {c}
              </Tag>
            ))}
            {p.scored_at && <Tag>scored {moment(p.scored_at).fromNow()}</Tag>}
          </div>
          <div className="sw-proposaldrawer-stats">
            <Stat label="Reuse score" value={p.score.toFixed(1)} />
            <Stat label="Owners" value={p.owners.toLocaleString('en')} />
            <Stat
              label="Repos"
              value={p.repos.toLocaleString('en')}
              hint={`${p.mainnet_repos.toLocaleString('en')} on mainnet`}
            />
            <Stat label="Fix commits" value={p.fix_commits.toLocaleString('en')} />
          </div>
          <Section title="Why it scores this high">
            {Object.entries(p.components)
              .sort((a, b) => b[1] - a[1])
              .map(([name, value]) => (
                <ScoreBar
                  key={name}
                  label={name}
                  value={value}
                  explain={EXPLAIN[name]}
                  negative={name === 'covered'}
                />
              ))}
          </Section>
          {p.sketch && (
            <Section title="Proposed shape">
              <CodeBlock code={p.sketch} caption="sketch" />
            </Section>
          )}
          {p.sample?.snippet && (
            <Section title="What people write today">
              <CodeBlock
                code={p.sample.snippet}
                caption={`${p.sample.repo ?? ''} ${p.sample.path ?? ''}`.trim()}
              />
            </Section>
          )}
          {p.fix_examples.length > 0 && (
            <Section title="Fixes that touched it">
              <ul className="sw-proposaldrawer-list">
                {p.fix_examples.map((f) => (
                  <li key={f.sha}>
                    <code>{f.sha.slice(0, 7)}</code> {f.message} <small>{f.repo}</small>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {p.bug_classes.length > 0 && (
            <Section title="Bug classes it prevents">
              <div className="sw-proposaldrawer-tags">
                {p.bug_classes.map((b) => (
                  <Tag key={b.id} tone={b.severity === 'critical' ? 'danger' : 'warn'}>
                    {b.name}
                  </Tag>
                ))}
              </div>
            </Section>
          )}
          <Section title={`Repos that write it (${p.linked_repo_total.toLocaleString('en')})`}>
            <ul className="sw-proposaldrawer-list">
              {p.linked_repos.slice(0, 12).map((r) => (
                <li key={r.full_name}>
                  <button type="button" onClick={() => onRepo(r.full_name)}>
                    {r.full_name}
                  </button>
                  <small>{r.stars.toLocaleString('en')} stars</small>
                </li>
              ))}
            </ul>
          </Section>
          {contracts.data && contracts.data.length > 0 && (
            <Section title="Deployed contracts of those repos">
              <ul className="sw-proposaldrawer-list">
                {contracts.data.slice(0, 8).map((c) => (
                  <li key={`${c.network}${c.contract_id}`}>
                    <button
                      type="button"
                      onClick={() => onContract(`${c.network}/${c.contract_id}`)}
                    >
                      <code>{c.contract_id.slice(0, 8)}</code>
                    </button>
                    <Tag tone={c.network === 'mainnet' ? 'primary' : 'secondary'}>{c.network}</Tag>
                    {c.live && <Tag tone="ok">live</Tag>}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          <Section title="Notes">
            <Comments kind="proposal" id={p.id} />
          </Section>
        </>
      )}
    </Drawer>
  )
}
