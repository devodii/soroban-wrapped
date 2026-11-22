import moment from 'moment'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as Chart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './LineChart.scss'

export interface Series {
  id: string
  label: string
  color: string
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

export function LineChart({
  data,
  series,
  label,
}: {
  data: Record<string, number>[]
  series: Series[]
  label: string
}) {
  return (
    <div className="sw-linechart" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={240}>
        <Chart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis
            dataKey="x"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(x: number) => moment.utc(x).format('MMM')}
            stroke="var(--axis)"
            tickLine={false}
            minTickGap={36}
          />
          <YAxis
            tickFormatter={(y: number) => compact.format(y)}
            stroke="var(--axis)"
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            labelFormatter={(x) => moment.utc(Number(x)).format('ddd, MMM D YYYY')}
            formatter={(value) => Number(value).toLocaleString('en')}
            contentStyle={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
            }}
          />
          <Legend iconType="plainline" />
          {series.map((s) => (
            <Line
              key={s.id}
              dataKey={s.id}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </Chart>
      </ResponsiveContainer>
    </div>
  )
}
