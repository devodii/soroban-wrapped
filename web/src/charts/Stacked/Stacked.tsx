import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './Stacked.scss'

export interface StackSeries {
  key: string
  label: string
  color: string
}

const compact = (n: number) =>
  n.toLocaleString('en', { notation: 'compact', maximumFractionDigits: 1 })

export function Stacked({
  data,
  series,
  format = compact,
  label,
  height = 240,
}: {
  data: Array<Record<string, number | string>>
  series: StackSeries[]
  format?: (value: number) => string
  label: string
  height?: number
}) {
  return (
    <div className="sw-stacked" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--axis)" tickLine={false} interval={0} />
          <YAxis
            tickFormatter={format}
            stroke="var(--axis)"
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            cursor={{ fill: 'var(--track)' }}
            formatter={(value) => format(Number(value))}
            contentStyle={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
            }}
          />
          <Legend iconType="circle" />
          {series.map((s, index) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stackId="stack"
              fill={s.color}
              radius={index === series.length - 1 ? [4, 4, 0, 0] : 0}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
