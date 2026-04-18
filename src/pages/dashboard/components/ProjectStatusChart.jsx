/**
 * ProjectStatusChart.jsx — Animated donut chart
 */

import { useState, useEffect } from 'react'

const DATA = [
  { label: 'Completed',   value: 18, color: '#10b981' },
  { label: 'In Progress', value: 12, color: '#f59e0b' },
  { label: 'Pending',     value:  7, color: '#e2e8f0' },
  { label: 'At Risk',     value:  3, color: '#ef4444' },
]
const total = DATA.reduce((s, d) => s + d.value, 0)

function AnimatedDonut({ animated }) {
  const size = 160, thickness = 28, r = (size - thickness) / 2
  const cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r

  let offset = 0
  const slices = DATA.map(d => {
    const pct = d.value / total
    const slice = { ...d, dash: animated ? pct * circ : 0, gap: circ - pct * circ, rot: offset * 360 }
    offset += pct
    return slice
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
      {slices.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill="none" stroke={s.color} strokeWidth={thickness}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeLinecap="butt"
          transform={`rotate(${s.rot} ${cx} ${cy})`}
          style={{ transition: `stroke-dasharray 0.9s cubic-bezier(0.34,1.3,0.64,1) ${i * 120}ms` }}
        />
      ))}
    </svg>
  )
}

export default function ProjectStatusChart() {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t) }, [])

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0a0f1e', margin: 0 }}>Project Status</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>Current distribution</p>
      </div>

      {/* Donut centered */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <AnimatedDonut animated={animated} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#0a0f1e', lineHeight: 1 }}>{total}</span>
            <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DATA.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, boxShadow: `0 0 6px ${d.color}60` }} />
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{d.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0a0f1e' }}>{d.value}</span>
              <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600 }}>{Math.round(d.value / total * 100)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stacked progress bar */}
      <div style={{ display: 'flex', height: 6, borderRadius: 99, overflow: 'hidden', gap: 2, marginTop: 18 }}>
        {DATA.map(d => (
          <div key={d.label} style={{ height: '100%', width: `${d.value / total * 100}%`, background: d.color, transition: 'width 0.8s ease', borderRadius: 99 }} />
        ))}
      </div>
    </div>
  )
}
