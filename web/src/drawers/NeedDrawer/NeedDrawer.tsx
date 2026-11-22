import * as React from 'react'
import { useNeed } from '../../lib/queries'
import { rfpMarkdown } from '../../lib/rfp'
import { GapAnalysis } from '../GapAnalysis/GapAnalysis'
import { Comments } from '../../comments/Comments/Comments'
import { CopyButton } from '../../ui/CopyButton/CopyButton'
import { Drawer } from '../../ui/Drawer/Drawer'
import { ErrorState } from '../../ui/ErrorState/ErrorState'
import { Markdown } from '../../ui/Markdown/Markdown'
import { ScoreBar } from '../../ui/ScoreBar/ScoreBar'
import { Section } from '../../ui/Section/Section'
import { Skeleton } from '../../ui/Skeleton/Skeleton'
import { Stat } from '../../ui/Stat/Stat'
import { Tabs } from '../../ui/Tabs/Tabs'
import { Tag } from '../../ui/Tag/Tag'
import './NeedDrawer.scss'

const markup = /<\/?b>/g

export function NeedDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const query = useNeed(id)
  const need = query.data
  const [kind, setKind] = React.useState<string | null>(null)
  const kinds = need?.evidence_counts.map((c) => c.kind) ?? []
  const active = kind && kinds.includes(kind) ? kind : (kinds[0] ?? '')
  const draft = need ? rfpMarkdown(need) : ''

  return (
    <Drawer
      open={!!id}
      onClose={onClose}
      eyebrow={need ? `Tooling need · ${need.category}` : 'Tooling need'}
      title={need?.title ?? 'Loading'}
      footer={need && <CopyButton text={draft} label="Copy RFP draft" variant="primary" />}
    >
      {query.isPending && <Skeleton height="12rem" />}
      {query.error && <ErrorState error={query.error} retry={() => query.refetch()} />}
      {need && (
        <>
          <p>{need.summary}</p>
          <div className="sw-needdrawer-stats">
            <Stat label="Demand score" value={need.score.toFixed(1)} />
            <Stat
              label="Pain issues"
              value={(need.demand.pain_issues ?? 0).toLocaleString('en')}
              hint={`${(need.demand.pain_owners ?? 0).toLocaleString('en')} owners`}
            />
            <Stat
              label="Repos with their own fix"
              value={(need.demand.custom_repos ?? 0).toLocaleString('en')}
            />
            <Stat label="Open issues" value={(need.demand.open_issues ?? 0).toLocaleString('en')} />
          </div>
          <Section title="How it scores">
            {Object.entries(need.components)
              .sort((a, b) => b[1] - a[1])
              .map(([name, value]) => (
                <ScoreBar
                  key={name}
                  label={name}
                  value={value}
                  tone="teal"
                  negative={name === 'covered'}
                />
              ))}
          </Section>
          <Section title="Existing tools">
            {need.tools.length === 0 ? (
              <Tag tone="danger">No tool in the catalog covers this</Tag>
            ) : (
              <ul className="sw-needdrawer-tools">
                {need.tools.map((t) => (
                  <li key={t.id}>
                    <a href={t.url ?? undefined} target="_blank" rel="noreferrer">
                      {t.name}
                    </a>
                    <Tag tone={t.relation === 'partial' ? 'warn' : 'ok'}>{t.relation}</Tag>
                    <small>{t.description}</small>
                  </li>
                ))}
              </ul>
            )}
          </Section>
          {need.rfp.gap_analysis.length > 0 && (
            <Section title="What is missing">
              <GapAnalysis tools={need.rfp.gap_analysis} />
            </Section>
          )}
          <Section title="Evidence">
            {kinds.length > 0 && (
              <Tabs
                value={active}
                onChange={setKind}
                items={need.evidence_counts.map((c) => ({
                  value: c.kind,
                  label: `${c.kind} · ${c.total.toLocaleString('en')}`,
                }))}
              />
            )}
            <ul className="sw-needdrawer-evidence">
              {need.evidence
                .filter((e) => e.kind === active)
                .map((e) => (
                  <li key={`${e.kind}${e.ref}${e.repo}`}>
                    <a href={e.url ?? undefined} target="_blank" rel="noreferrer">
                      {e.title ?? e.ref}
                    </a>
                    <small>{e.repo}</small>
                    {e.snippet && <p>{e.snippet.replace(markup, '').slice(0, 220)}</p>}
                  </li>
                ))}
            </ul>
          </Section>
          <Section title="RFP draft">
            <div className="sw-needdrawer-draft">
              <Markdown>{draft}</Markdown>
            </div>
          </Section>
          <Section title="Notes">
            <Comments kind="need" id={need.id} />
          </Section>
        </>
      )}
    </Drawer>
  )
}
