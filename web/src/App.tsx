import * as React from 'react'
import { useWrapped } from './lib/queries'
import { Composability } from './sections/Composability/Composability'
import { Concentration } from './sections/Concentration/Concentration'
import { Footer } from './sections/Footer/Footer'
import { Hero } from './sections/Hero/Hero'
import { Leaderboard } from './sections/Leaderboard/Leaderboard'
import { Nav } from './sections/Nav/Nav'
import type { NetworkName } from './sections/Nav/Nav'
import { Pulse } from './sections/Pulse/Pulse'
import { Rhythm } from './sections/Rhythm/Rhythm'
import { Stack } from './sections/Stack/Stack'
import { ErrorState } from './ui/ErrorState/ErrorState'
import { Skeleton } from './ui/Skeleton/Skeleton'
import './App.scss'

export function App() {
  const [network, setNetwork] = React.useState<NetworkName>('mainnet')
  const wrapped = useWrapped(network)
  const data = wrapped.data

  return (
    <>
      <Nav network={network} onNetwork={setNetwork} />
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
            <section id="pulse" className="sw-app-section">
              <Pulse data={data} />
            </section>
            <section id="concentration" className="sw-app-section">
              <Concentration data={data} />
            </section>
            <section id="leaders" className="sw-app-section">
              <Leaderboard data={data} />
            </section>
            <section id="rhythm" className="sw-app-section">
              <Rhythm data={data} />
            </section>
            <section id="graph" className="sw-app-section sw-app-wide">
              <Composability data={data} />
            </section>
            <section id="stack" className="sw-app-section">
              <Stack data={data} />
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
