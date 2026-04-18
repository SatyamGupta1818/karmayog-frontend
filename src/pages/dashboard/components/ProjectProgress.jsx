/**
 * ProjectProgress.jsx — Animated bar chart
 */

import { useState, useEffect } from 'react'

const WEEKS = [
  { week: 'W1', completed: 18, created: 22 },
  { week: 'W2', completed: 24, created: 27 },
  { week: 'W3', completed: 21, created: 23 },
  { week: 'W4', completed: 32, created: 35 },
  { week: 'W5', completed: 28, created: 29 },
  { week: 'W6', completed: 38, created: 40 },
  { week: 'W7', completed: 35, created: 36 },
]

const MAX_VAL = 45
const CHART_H = 150
const BAR_W = 14
const PAIR_GAP = 5
const COL_GAP = 30
const LEFT_PAD = 32

export default function ProjectProgress() {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t) }, [])

  const totalCompleted = WEEKS.reduce((s, w) => s + w.completed, 0)
  const totalCreated   = WEEKS.reduce((s, w) => s + w.created, 0)
  const pct = Math.round(totalCompleted / totalCreated * 100)

  const COLS  = WEEKS.length
  const SVG_W = COLS * (BAR_W * 2 + PAIR_GAP + COL_GAP)
  const Y_LABELS = [0, 10, 20, 30, 40]

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0a0f1e', margin: 0 }}>Project Progress</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>Weekly tasks — created vs completed</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 32, fontWeight: 900, color: '#f59e0b', lineHeight: 1, margin: 0, letterSpacing: '-1px' }}>{pct}%</p>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Completion rate</p>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 18 }}>
        {[{ label: 'Completed', color: '#0d1b3e' }, { label: 'Created', color: '#f59e0b' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${SVG_W + LEFT_PAD + 16} ${CHART_H + 32}`} style={{ width: '100%', minWidth: 320 }}>
          {/* Grid lines */}
          {Y_LABELS.map(y => {
            const yPos = CHART_H - (y / MAX_VAL) * CHART_H
            return (
              <g key={y}>
                <line x1={LEFT_PAD} y1={yPos} x2={SVG_W + LEFT_PAD} y2={yPos} stroke="#f1f5f9" strokeWidth={1} />
                <text x={LEFT_PAD - 6} y={yPos + 4} textAnchor="end" fontSize={9} fill="#cbd5e1" fontWeight={600}>{y}</text>
              </g>
            )
          })}

          {/* Bars */}
          {WEEKS.map((w, i) => {
            const colW   = BAR_W * 2 + PAIR_GAP + COL_GAP
            const x      = LEFT_PAD + i * colW + COL_GAP / 2
            const compH  = animated ? (w.completed / MAX_VAL) * CHART_H : 0
            const creatH = animated ? (w.created   / MAX_VAL) * CHART_H : 0
            const cx     = x + BAR_W + PAIR_GAP / 2

            return (
              <g key={w.week}>
                {/* Completed bar */}
                <rect
                  x={x} y={CHART_H - compH} width={BAR_W} height={compH} rx={5} fill="#0d1b3e"
                  style={{ transition: `height 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms, y 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms` }}
                />
                {/* Created bar */}
                <rect
                  x={x + BAR_W + PAIR_GAP} y={CHART_H - creatH} width={BAR_W} height={creatH} rx={5}
                  fill="url(#yellowGrad)"
                  style={{ transition: `height 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 60 + 80}ms, y 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 60 + 80}ms` }}
                />
                <text x={cx} y={CHART_H + 20} textAnchor="middle" fontSize={10} fill="#94a3b8" fontWeight={700}>{w.week}</text>
              </g>
            )
          })}
          <defs>
            <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Bottom stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, paddingTop: 16, borderTop: '1px solid #f8fafc', marginTop: 4 }}>
        {[
          { label: 'Completed', value: totalCompleted, color: '#0d1b3e' },
          { label: 'Created',   value: totalCreated,   color: '#f59e0b' },
          { label: 'Backlog',   value: totalCreated - totalCompleted, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center', padding: '10px 0', borderRadius: 12, background: '#fafafa' }}>
            <p style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
