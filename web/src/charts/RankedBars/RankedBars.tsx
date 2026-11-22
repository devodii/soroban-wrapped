import * as React from 'react'
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import './RankedBars.scss'

export interface RankedRow {
  id: string
  label: string
  value: number
}

const ROW_HEIGHT = 34
const NARROW = '(max-width: 40rem)'
const LABEL_WIDTH = 236
const NARROW_LABEL_WIDTH = 104

export function RankedBars({
  rows,
  onSelect,
  active,
  format = (n: number) => n.toFixed(1),
}: {
  rows: RankedRow[]
  onSelect?: (id: string) => void
  active?: string | null
  format?: (value: number) => string
}) {
  const narrow = React.useSyncExternalStore(
    (listener) => {
      const query = matchMedia(NARROW)
      query.addEventListener('change', listener)
      return () => query.removeEventListener('change', listener)
    },
    () => matchMedia(NARROW).matches,
  )
  const limit = narrow ? 14 : 34
  return (
    <div className="sw-rankedbars">
      <ResponsiveContainer width="100%" height={rows.length * ROW_HEIGHT}>
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 0, right: 48, bottom: 0, left: 0 }}
          barCategoryGap="22%"
        >
          <XAxis type="number" hide domain={[0, 'dataMax']} />
          <YAxis
            type="category"
            dataKey="label"
            width={narrow ? NARROW_LABEL_WIDTH : LABEL_WIDTH}
            tickLine={false}
            axisLine={false}
            tickFormatter={(label: string) =>
              label.length > limit ? `${label.slice(0, limit - 1)}…` : label
            }
          />
          <Bar
            dataKey="value"
            radius={6}
            background={{ fill: 'var(--track)', radius: 6 }}
            isAnimationActive={false}
            cursor={onSelect ? 'pointer' : undefined}
            onClick={(_, index) => {
              const row = rows[index]
              if (row) onSelect?.(row.id)
            }}
          >
            {rows.map((row, index) => (
              <Cell
                key={row.id}
                fill={index === 0 || row.id === active ? 'var(--primary)' : 'var(--chart-3)'}
              />
            ))}
            <LabelList dataKey="value" position="right" formatter={(v) => format(Number(v))} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
