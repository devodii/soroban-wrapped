import * as React from 'react'
import type { NeedItem } from '../../lib/api-schema'
import { useNeeds } from '../../lib/queries'
import { Button } from '../../ui/Button/Button'
import { Card } from '../../ui/Card/Card'
import { Chip } from '../../ui/Chip/Chip'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Tag } from '../../ui/Tag/Tag'
import './Needs.scss'

const FIRST = 9

export function Needs({ needs, onNeed }: { needs: NeedItem[]; onNeed: (id: string) => void }) {
  const [all, setAll] = React.useState(false)
  const [category, setCategory] = React.useState<string | null>(null)
  const full = useNeeds(all)
  const source = all && full.data ? full.data : needs
  const categories = Array.from(new Set(source.map((n) => n.category))).sort()
  const shown = source
    .filter((n) => !category || n.category === category)
    .slice(0, all ? undefined : FIRST)

  return (
    <div className="sw-needs">
      <SectionHeader index="02 · Tooling gaps" title="What the ecosystem is missing">
        Every need is ranked from issues, pull requests, docs and questions across Stellar repos.
        Open one for the evidence, the tools that partly cover it and an RFP draft you can copy.
      </SectionHeader>
      <div className="sw-needs-chips">
        <Chip active={category === null} onClick={() => setCategory(null)}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
            {c}
          </Chip>
        ))}
      </div>
      <ol className="sw-needs-grid">
        {shown.map((need, index) => (
          <li key={need.id}>
            <button type="button" className="sw-needs-card" onClick={() => onNeed(need.id)}>
              <Card>
                <div className="sw-needs-top">
                  <span className="sw-needs-rank">{String(index + 1).padStart(2, '0')}</span>
                  <Tag tone="secondary">{need.category}</Tag>
                  {need.priority && (
                    <Tag tone={need.priority === 'high' ? 'warn' : 'neutral'}>{need.priority}</Tag>
                  )}
                </div>
                <h3>{need.title}</h3>
                <p>{need.summary}</p>
                <dl className="sw-needs-stats">
                  <div>
                    <dt>pain issues</dt>
                    <dd>{need.pain_issues.toLocaleString('en')}</dd>
                  </div>
                  <div>
                    <dt>owners</dt>
                    <dd>{need.owners.toLocaleString('en')}</dd>
                  </div>
                  <div>
                    <dt>score</dt>
                    <dd>{need.score.toFixed(1)}</dd>
                  </div>
                </dl>
                <div className="sw-needs-foot">
                  {need.tools.length ? (
                    <Tag tone="ok">{need.tools.length} existing tools</Tag>
                  ) : (
                    <Tag tone="danger">no tool covers it</Tag>
                  )}
                </div>
              </Card>
            </button>
          </li>
        ))}
      </ol>
      {!all && source.length > FIRST && (
        <div className="sw-needs-more">
          <Button onClick={() => setAll(true)}>
            Show all {needs.length > FIRST ? 'needs' : ''}
          </Button>
        </div>
      )}
    </div>
  )
}
