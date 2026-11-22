import type { NeedDetail } from './api-schema'

export function rfpMarkdown(need: NeedDetail): string {
  const { rfp } = need
  const list = (items: string[]) => items.map((item) => `- ${item}`).join('\n')
  const parts = [
    `# RFP: ${rfp.title || need.title}`,
    `Priority: ${rfp.priority || 'unrated'} · demand score ${need.score.toFixed(1)}`,
    `## Problem\n${rfp.problem || need.summary}`,
    rfp.gap ? `## Gap in existing tools\n${rfp.gap}` : '',
    rfp.deliverables.length ? `## Deliverables\n${list(rfp.deliverables)}` : '',
    rfp.success_metrics.length ? `## Success metrics\n${list(rfp.success_metrics)}` : '',
    rfp.who_is_affected.length
      ? `## Who is affected\n${list(rfp.who_is_affected.map((a) => `${a.repos.toLocaleString('en')} ${a.stack} repos`))}`
      : '',
    rfp.existing_tools.length
      ? `## Existing tools\n${list(rfp.existing_tools.map((t) => `${t.name} (${t.relation})${t.url ? ` ${t.url}` : ''}`))}`
      : '',
    need.evidence.length
      ? `## Evidence\n${list(need.evidence.slice(0, 8).map((e) => `${e.title ?? e.kind}${e.url ? ` ${e.url}` : ''}`))}`
      : '',
  ]
  return parts.filter(Boolean).join('\n\n')
}
