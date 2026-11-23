import * as React from 'react'
import { useWrapped } from './lib/queries'
import { Activity } from './sections/Activity/Activity'
import { Anatomy } from './sections/Anatomy/Anatomy'
import { Concentration } from './sections/Concentration/Concentration'
import { Footer } from './sections/Footer/Footer'
import { Nav } from './sections/Nav/Nav'
import type { NetworkName } from './sections/Nav/Nav'
import { Summary } from './sections/Summary/Summary'
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
            <Summary data={data} />
            <section id="activity" className="sw-app-section">
              <Activity data={data} />
            </section>
            <section id="concentration" className="sw-app-section">
              <Concentration data={data} />
            </section>
            <section id="anatomy" className="sw-app-section">
              <Anatomy data={data} />
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
