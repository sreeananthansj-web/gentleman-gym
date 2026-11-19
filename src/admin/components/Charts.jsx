import { monthLabel } from '../../utils/format'

/** Vertical bar chart (SVG) for the monthly enquiry overview. */
export function MonthlyChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const height = 160
  const barWidth = 36
  const gap = 18
  const width = data.length * (barWidth + gap) - gap
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width} ${height + 26}`}
        role="img"
        aria-label={`Enquiries per month. ${data.map((d) => `${monthLabel(d.month)}: ${d.count}`).join(', ')}`}
        className="h-auto w-full"
      >
        <line x1="0" x2={width} y1={height} y2={height} stroke="rgba(255,255,255,0.15)" />
        {data.map((d, index) => {
          const barHeight = d.count === 0 ? 2 : Math.max(4, (d.count / max) * (height - 18))
          const x = index * (barWidth + gap)
          const isLast = index === data.length - 1
          return (
            <g key={d.month}>
              <rect
                x={x}
                y={height - barHeight}
                width={barWidth}
                height={barHeight}
                fill={isLast ? '#d8a94b' : 'rgba(216,169,75,0.38)'}
              />
              <text x={x + barWidth / 2} y={height - barHeight - 6} textAnchor="middle" fontSize="11" fill="#f4f1ea">
                {d.count}
              </text>
              <text x={x + barWidth / 2} y={height + 18} textAnchor="middle" fontSize="10" fill="#a6a6a6">
                {monthLabel(d.month)}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption className="sr-only">{total} enquiries over the last {data.length} months.</figcaption>
    </figure>
  )
}

/** Horizontal proportion bars: [{ label, value, tone }] */
export function BreakdownBars({ items, total }) {
  if (total === 0) return <p className="text-sm text-mist">No data yet.</p>
  return (
    <ul className="space-y-3.5">
      {items.map((item) => {
        const pct = Math.round((item.value / total) * 100)
        return (
          <li key={item.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
              <span className="truncate text-bone">{item.label}</span>
              <span className="shrink-0 tabular-nums text-mist">
                {item.value} <span className="text-white/35">· {pct}%</span>
              </span>
            </div>
            <div
              className="h-1.5 bg-white/[0.07]"
              role="progressbar"
              aria-label={item.label}
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full" style={{ width: `${pct}%`, background: item.color ?? '#d8a94b' }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
