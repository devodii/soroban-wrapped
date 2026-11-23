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
import './Pareto.scss'

export interface ParetoPoint {
  contracts: number
  share: number
}

export interface Callout {
  contracts: number
  label: string
}

export function Pareto({
  points,
  callouts,
  label,
}: {
  points: ParetoPoint[]
  callouts: Callout[]
  label: string
}) {
  const last = points[points.length - 1]?.contracts ?? 1
  return (
    <div className="sw-pareto" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={points} margin={{ top: 28, right: 24, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis
            dataKey="contracts"
            type="number"
            scale="log"
            domain={[1, last]}
            ticks={[1, 10, 100, 1000, 10000, 100000].filter((t) => t <= last)}
            tickFormatter={(n: number) => n.toLocaleString('en', { notation: 'compact' })}
            stroke="var(--axis)"
            tickLine={false}
            allowDataOverflow
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(n: number) => `${n}%`}
            stroke="var(--axis)"
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            labelFormatter={(n) => `Top ${Number(n).toLocaleString('en')} contracts`}
            formatter={(value) => [`${Number(value).toFixed(1)}% of all calls`, '']}
            contentStyle={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
            }}
          />
          <Area
            dataKey="share"
            type="monotone"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            fill="var(--glow-primary)"
            dot={false}
            isAnimationActive={false}
          />
          {callouts.map((c) => {
            const point = points.find((p) => p.contracts === c.contracts)
            return (
              point && (
                <ReferenceDot
                  key={c.label}
                  x={point.contracts}
                  y={point.share}
                  r={5}
                  fill="var(--foreground)"
                  stroke="var(--background)"
                  strokeWidth={2}
                  label={{
                    value: c.label,
                    position: 'bottom',
                    fontSize: 11,
                    fill: 'var(--foreground)',
                  }}
                />
              )
            )
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
