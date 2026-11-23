import * as React from 'react'
import { useWrapped } from './lib/queries'
import { Activity } from './sections/Activity/Activity'
import { Contracts } from './sections/Contracts/Contracts'
import { Footer } from './sections/Footer/Footer'
import { Hero } from './sections/Hero/Hero'
import { Nav } from './sections/Nav/Nav'
import type { NetworkName } from './sections/Nav/Nav'
import { Takeaways } from './sections/Takeaways/Takeaways'
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
            <section id="activity" className="sw-app-section">
              <Activity data={data} />
            </section>
            <section id="contracts" className="sw-app-section">
              <Contracts data={data} />
            </section>
            <section id="takeaways" className="sw-app-section">
              <Takeaways data={data} />
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
