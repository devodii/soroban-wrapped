import type { PatternItem, ProposalItem } from '../../lib/api-schema'
import { CodeBlock } from '../../ui/CodeBlock/CodeBlock'
import { Drawer } from '../../ui/Drawer/Drawer'
import { Section } from '../../ui/Section/Section'
import { Stat } from '../../ui/Stat/Stat'
import { Tag } from '../../ui/Tag/Tag'
import '../ProposalDrawer/ProposalDrawer.scss'

export function PatternDrawer({
  pattern,
  proposals,
  onClose,
  onProposal,
}: {
  pattern: PatternItem | undefined
  proposals: ProposalItem[]
  onClose: () => void
  onProposal: (id: string) => void
}) {
  return (
    <Drawer
      open={!!pattern}
      onClose={onClose}
      eyebrow={`Pattern · ${pattern?.category ?? ''}`}
      title={pattern?.id ?? ''}
    >
      {pattern && (
        <>
          <p>{pattern.description}</p>
          <div className="sw-proposaldrawer-tags">
            <Tag tone={pattern.origin === 'mined' ? 'primary' : 'neutral'}>{pattern.origin}</Tag>
            <Tag>{pattern.status}</Tag>
          </div>
          <div className="sw-proposaldrawer-stats">
            <Stat label="Repos" value={pattern.repos.toLocaleString('en')} />
            <Stat label="Occurrences" value={pattern.occurrences.toLocaleString('en')} />
          </div>
          {pattern.sample && (
            <Section title="A real example">
              <CodeBlock
                code={pattern.sample}
                caption={`${pattern.sample_repo ?? ''} ${pattern.sample_path ?? ''}`.trim()}
              />
            </Section>
          )}
          {pattern.proposals.length > 0 && (
            <Section title="Proposals built on it">
              <ul className="sw-proposaldrawer-list">
                {pattern.proposals.map((id) => (
                  <li key={id}>
                    <button type="button" onClick={() => onProposal(id)}>
                      {proposals.find((p) => p.id === id)?.name ?? id}
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      )}
    </Drawer>
  )
}
