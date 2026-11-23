import * as React from 'react'
import moment from 'moment'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './AreaTrend.scss'

export interface Marker {
  x: number
  y: number
  label: string
}

export interface TrendPoint {
  x: number
  y: number
}

export function AreaTrend({
  data,
  markers = [],
  color = 'var(--chart-1)',
  format = (n: number) => n.toLocaleString('en', { notation: 'compact', maximumFractionDigits: 1 }),
  label,
  height = 260,
}: {
  data: TrendPoint[]
  markers?: Marker[]
  color?: string
  format?: (value: number) => string
  label: string
  height?: number
}) {
  const ticks = data
    .map((point) => moment.utc(point.x).startOf('month').valueOf())
    .filter((month, index, all) => all.indexOf(month) === index)
    .filter((month) => month >= (data[0]?.x ?? 0))
  const gradient = `sw-areatrend-${React.useId().replace(/:/g, '')}`
  return (
    <div className="sw-areatrend" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 28, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis
            dataKey="x"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            ticks={ticks}
            tickFormatter={(x: number) => moment.utc(x).format('MMM')}
            stroke="var(--axis)"
            tickLine={false}
          />
          <YAxis
            tickFormatter={format}
            stroke="var(--axis)"
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            labelFormatter={(x) => moment.utc(Number(x)).format('ddd, MMM D YYYY')}
            formatter={(value) => [format(Number(value)), label]}
            contentStyle={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
            }}
          />
          <Area
            dataKey="y"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradient})`}
            dot={false}
            isAnimationActive={false}
          />
          {markers.map((m) => (
            <ReferenceDot
              key={m.label}
              x={m.x}
              y={m.y}
              r={5}
              fill="var(--foreground)"
              stroke="var(--background)"
              strokeWidth={2}
              label={{ value: m.label, position: 'top', fontSize: 11, fill: 'var(--foreground)' }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
