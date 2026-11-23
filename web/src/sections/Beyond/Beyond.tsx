import moment from 'moment'
import type { Wrapped } from '../../lib/api-schema'
import { HBars } from '../../charts/HBars/HBars'
import { Stacked } from '../../charts/Stacked/Stacked'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Tile } from '../../ui/Tile/Tile'
import './Beyond.scss'

export function Beyond({ data }: { data: Wrapped }) {
  const f = data.funnel
  return (
    <>
      <SectionHeader
        index="03 · Beyond the giants"
        title={`What the network looks like without its top ${data.giants}`}
      />
      <div className="sw-beyond-grid">
        <Tile title="Calls by month" note={`top ${data.giants} contracts against everyone else`}>
          <Stacked
            label="Monthly calls from the top contracts and from everyone else"
            series={[
              { key: 'giants', label: `Top ${data.giants} contracts`, color: 'var(--chart-1)' },
              { key: 'others', label: 'Every other contract', color: 'var(--chart-2)' },
            ]}
            data={data.split.map((m) => ({
              label: moment.utc(m.month).format('MMM'),
              giants: m.giants,
              others: m.others,
            }))}
          />
        </Tile>
        <Tile title="Do new contracts stay?" note="by the month they first appeared">
          <Stacked
            label="Contracts by first month and whether they were active in the last 30 days"
            format={(n) => n.toLocaleString('en')}
            series={[
              { key: 'active', label: 'Still called in the last 30 days', color: 'var(--chart-2)' },
              { key: 'gone', label: 'Gone quiet', color: 'var(--net-none)' },
            ]}
            data={data.cohorts.map((c) => ({
              label: moment.utc(c.month).format('MMM'),
              active: c.active,
              gone: c.contracts - c.active,
            }))}
          />
        </Tile>
        <Tile
          title="From deployed to depended on"
          note={`the median contract was called ${f.median_calls.toLocaleString('en')} times`}
          className="sw-beyond-wide"
        >
          <HBars
            label="How many contracts clear each bar"
            color="var(--chart-3)"
            format={(n) => n.toLocaleString('en')}
            rows={[
              { id: 'all', label: 'Ever called', value: f.contracts },
              { id: 'k', label: 'Called 1,000+ times', value: f.over_thousand_calls },
              { id: 'month', label: 'Active on 30+ days', value: f.active_a_month },
              { id: 'half', label: 'Active on 180+ days', value: f.active_half_a_year },
              { id: 'heavy', label: 'Called 100,000+ times', value: f.over_hundred_thousand_calls },
            ].sort((x, y) => y.value - x.value)}
          />
        </Tile>
      </div>
    </>
  )
}
