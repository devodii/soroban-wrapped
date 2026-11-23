import moment from 'moment'
import type { Wrapped } from '../../lib/api-schema'
import { Bars } from '../../ui/Bars/Bars'
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import { Tile } from '../../ui/Tile/Tile'
import './Rhythm.scss'

const compact = (n: number) =>
  n.toLocaleString('en', { notation: 'compact', maximumFractionDigits: 1 })

const LABELS = {
  most_calls: 'Busiest day',
  most_transactions: 'Most transactions',
  highest_failure_rate: 'Most failures',
  lowest_failure_rate: 'Cleanest day',
  biggest_jump: 'Biggest jump',
  quietest: 'Quietest day',
} as const

export function Rhythm({ data }: { data: Wrapped }) {
  return (
    <>
      <SectionHeader index="04 · Rhythm" title="Records and the weekly beat">
        The days that set the bar, and which weekday the network is busiest and most error-prone.
      </SectionHeader>
      <div className="sw-rhythm-records">
        {data.records.map((r) => (
          <Tile key={r.kind} title={LABELS[r.kind]} note={moment.utc(r.day).format('ddd, MMM D')}>
            <div className="sw-rhythm-value">
              {r.kind.endsWith('failure_rate') ? `${r.value.toFixed(1)}%` : compact(r.value)}
            </div>
            <p className="sw-rhythm-unit">
              {r.kind.endsWith('failure_rate')
                ? 'of transactions failed'
                : r.kind === 'most_transactions'
                  ? 'transactions'
                  : r.kind === 'biggest_jump'
                    ? 'more calls than the day before'
                    : 'contract calls'}
            </p>
          </Tile>
        ))}
      </div>
      <div className="sw-rhythm-weekdays">
        <Tile title="Average calls by weekday" note="finished days only">
          <Bars
            tone="secondary"
            format={compact}
            rows={data.weekdays.map((w) => ({
              id: String(w.weekday),
              label: moment().isoWeekday(w.weekday).format('dddd'),
              value: w.contract_calls,
              hint: `${w.failure_percent.toFixed(1)}% of transactions fail`,
            }))}
          />
        </Tile>
      </div>
    </>
  )
}
