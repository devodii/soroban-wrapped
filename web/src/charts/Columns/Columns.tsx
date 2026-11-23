import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './Columns.scss'

export interface Column {
  label: string
  value: number
  note?: string
}

export function Columns({
  data,
  color = 'var(--chart-2)',
  highlight,
  format = (n: number) => n.toLocaleString('en', { notation: 'compact', maximumFractionDigits: 1 }),
  label,
  height = 220,
}: {
  data: Column[]
  color?: string
  highlight?: string
  format?: (value: number) => string
  label: string
  height?: number
}) {
  return (
    <div className="sw-columns" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--axis)" tickLine={false} interval={0} />
          <YAxis
            tickFormatter={format}
            stroke="var(--axis)"
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            cursor={{ fill: 'var(--track)' }}
            formatter={(value, _name, item) => [
              format(Number(value)),
              (item.payload as Column).note ?? label,
            ]}
            contentStyle={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.label} fill={d.label === highlight ? 'var(--primary)' : color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
