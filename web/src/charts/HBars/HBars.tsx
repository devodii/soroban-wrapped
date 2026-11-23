import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import './HBars.scss'

export interface HBar {
  id: string
  label: string
  value: number
}

const ROW = 32

export function HBars({
  rows,
  color = 'var(--chart-3)',
  format = (n: number) => n.toLocaleString('en', { notation: 'compact', maximumFractionDigits: 1 }),
  labelWidth = 150,
  label,
}: {
  rows: HBar[]
  color?: string
  format?: (value: number) => string
  labelWidth?: number
  label: string
}) {
  return (
    <div className="sw-hbars" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={rows.length * ROW + 8}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 0 }}>
          <XAxis type="number" hide domain={[0, 'dataMax']} />
          <YAxis
            type="category"
            dataKey="label"
            width={labelWidth}
            tickLine={false}
            axisLine={false}
            stroke="var(--foreground)"
          />
          <Bar
            dataKey="value"
            radius={4}
            background={{ fill: 'var(--track)', radius: 4 }}
            isAnimationActive={false}
          >
            {rows.map((row, index) => (
              <Cell key={row.id} fill={index === 0 ? 'var(--primary)' : color} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v) => format(Number(v))}
              fill="var(--foreground)"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
