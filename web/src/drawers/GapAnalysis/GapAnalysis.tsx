import * as React from 'react'
import type { GapTool } from '../../lib/api-schema'
import { Tag } from '../../ui/Tag/Tag'
import './GapAnalysis.scss'

const verdictTone = {
  contribute: 'ok',
  'build-new': 'danger',
  review: 'warn',
  unverified: 'neutral',
} as const

const verdictLabel = {
  contribute: 'Contribute upstream',
  'build-new': 'Build a new tool',
  review: 'Ask upstream, then decide',
  unverified: 'Hosted or closed',
} as const

const statusLabel: Record<string, string> = {
  covered: 'covered',
  partly: 'partly covered',
  related: 'related open issue',
  missing: 'missing',
  unknown: 'not checked',
}

export function GapAnalysis({ tools }: { tools: GapTool[] }): React.ReactElement {
  return (
    <div className="sw-gap-list">
      {tools.map((tool) => {
        const verdict = tool.verdict as keyof typeof verdictTone
        return (
          <article key={tool.tool} className="sw-gap-tool">
            <header>
              <a href={tool.url ?? undefined} target="_blank" rel="noreferrer">
                {tool.name}
              </a>
              <Tag tone={verdictTone[verdict] ?? 'neutral'}>
                {verdictLabel[verdict] ?? tool.verdict}
              </Tag>
            </header>
            <p>{tool.summary}</p>
            <ul className="sw-gap-items">
              {tool.items.map((item) => (
                <li key={item.item} data-status={item.status}>
                  <span>{item.item}</span>
                  <small>{statusLabel[item.status] ?? item.status}</small>
                  {item.evidence.slice(0, 2).map((e) => (
                    <a key={e.url} href={e.url} target="_blank" rel="noreferrer">
                      {e.title}
                      <em>
                        {' '}
                        · {e.reactions} reactions · {e.comments} comments
                      </em>
                    </a>
                  ))}
                </li>
              ))}
            </ul>
          </article>
        )
      })}
    </div>
  )
}
