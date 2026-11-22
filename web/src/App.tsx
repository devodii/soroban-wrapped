import * as React from 'react'
import { CommandCenter } from './CommandCenter/CommandCenter'
import { ContractDrawer } from './drawers/ContractDrawer/ContractDrawer'
import { NeedDrawer } from './drawers/NeedDrawer/NeedDrawer'
import { PatternDrawer } from './drawers/PatternDrawer/PatternDrawer'
import { ProposalDrawer } from './drawers/ProposalDrawer/ProposalDrawer'
import { RepoDrawer } from './drawers/RepoDrawer/RepoDrawer'
import { useWrapped } from './lib/queries'
import { setParams, useParam } from './lib/url'
import { Chain } from './sections/Chain/Chain'
import { Footer } from './sections/Footer/Footer'
import { HandWritten } from './sections/HandWritten/HandWritten'
import { Hero } from './sections/Hero/Hero'
import { Nav } from './sections/Nav/Nav'
import { Needs } from './sections/Needs/Needs'
import type { OpenEntity } from './sections/GraphSection/GraphSection'
import { SectionHeader } from './ui/SectionHeader/SectionHeader'
import { ErrorState } from './ui/ErrorState/ErrorState'
import { Skeleton } from './ui/Skeleton/Skeleton'
import './App.scss'

const GraphSection = React.lazy(() => import('./sections/GraphSection/GraphSection'))

const CLOSED = { proposal: null, need: null, repo: null, contract: null, pattern: null }

export function App() {
  const wrapped = useWrapped()
  const [palette, setPalette] = React.useState(false)
  const proposal = useParam('proposal')
  const need = useParam('need')
  const repo = useParam('repo')
  const contract = useParam('contract')
  const pattern = useParam('pattern')

  const showInGraph = (node: string, scope?: 'chain') => {
    setParams({ ...CLOSED, node, g: scope ?? null })
    document.getElementById('graph')?.scrollIntoView({ behavior: 'smooth' })
  }

  const open = (entity: OpenEntity) => {
    if (entity.kind === 'proposal') setParams({ proposal: entity.id })
    if (entity.kind === 'repo') setParams({ repo: entity.id })
    if (entity.kind === 'contract') setParams({ contract: entity.id })
  }

  const data = wrapped.data

  return (
    <>
      <Nav onPalette={() => setPalette(true)} />
      <main>
        {wrapped.isPending && <Skeleton width="100%" height="32rem" />}
        {wrapped.error && (
          <div className="sw-app-section">
            <ErrorState error={wrapped.error} retry={() => wrapped.refetch()} />
          </div>
        )}
        {data && (
          <>
            <Hero data={data} />
            <section id="hand-written" className="sw-app-section">
              <HandWritten
                proposals={data.top_proposals}
                patterns={data.top_patterns}
                patternsWarming={data.patterns_warming}
                onProposal={(id) => setParams({ proposal: id })}
                onPattern={(id) => setParams({ pattern: id })}
              />
            </section>
            <section id="needs" className="sw-app-section">
              <Needs needs={data.top_needs} onNeed={(id) => setParams({ need: id })} />
            </section>
            <section id="chain" className="sw-app-section">
              <Chain
                days={data.days}
                contracts={data.top_contracts}
                edges={data.top_edges}
                warming={data.chain_warming}
                onContract={(key) => setParams({ contract: key })}
                onShowGraph={() => {
                  setParams({ g: 'chain', node: null })
                  document.getElementById('graph')?.scrollIntoView({ behavior: 'smooth' })
                }}
              />
            </section>
            <section id="graph" className="sw-app-section sw-app-wide">
              <SectionHeader index="04 · The graph" title="Everything, connected">
                Proposals, the repos that hand-write them, and the contracts those repos deploy,
                laid out in 3D. Hover to light up neighbours, click to fly in, switch to on-chain
                calls to see which contracts really talk to each other.
              </SectionHeader>
              <React.Suspense fallback={<Skeleton width="100%" height="34rem" />}>
                <GraphSection onOpen={open} />
              </React.Suspense>
            </section>
          </>
        )}
      </main>
      <Footer />
      <ProposalDrawer
        id={proposal}
        onClose={() => setParams({ proposal: null })}
        onGraph={(id) => showInGraph(`proposal:${id}`)}
        onRepo={(r) => setParams({ proposal: null, repo: r })}
        onContract={(c) => setParams({ proposal: null, contract: c })}
      />
      <NeedDrawer id={need} onClose={() => setParams({ need: null })} />
      <RepoDrawer
        fullName={repo}
        onClose={() => setParams({ repo: null })}
        onGraph={(id) => showInGraph(`repo:${id}`)}
        onProposal={(id) => setParams({ repo: null, proposal: id })}
        onNeed={(id) => setParams({ repo: null, need: id })}
        onContract={(c) => setParams({ repo: null, contract: c })}
      />
      <ContractDrawer
        keyId={contract}
        onClose={() => setParams({ contract: null })}
        onGraph={(id) => showInGraph(`contract:${id}`, 'chain')}
        onRepo={(r) => setParams({ contract: null, repo: r })}
      />
      <PatternDrawer
        pattern={data?.top_patterns.find((p) => p.id === pattern)}
        proposals={data?.top_proposals ?? []}
        onClose={() => setParams({ pattern: null })}
        onProposal={(id) => setParams({ pattern: null, proposal: id })}
      />
      <CommandCenter
        open={palette}
        onOpen={() => setPalette(true)}
        onClose={() => setPalette(false)}
      />
    </>
  )
}
