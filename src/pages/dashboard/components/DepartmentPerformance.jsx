/**
 * DepartmentPerformance.jsx — Animated progress bars per department
 */

import { useState, useEffect } from 'react'

const DEPARTMENTS = [
  { name: 'Engineering', completed: 42, total: 55, members: 14, color: '#0d1b3e' },
  { name: 'Design',      completed: 21, total: 24, members:  6, color: '#6366f1' },
  { name: 'Product',     completed: 28, total: 33, members:  8, color: '#f59e0b' },
  { name: 'HR',          completed: 16, total: 22, members:  9, color: '#10b981' },
  { name: 'Finance',     completed: 12, total: 19, members:  7, color: '#f97316' },
  { name: 'Marketing',   completed:  9, total: 15, members:  5, color: '#ec4899' },
]

export default function DepartmentPerformance() {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 500); return () => clearTimeout(t) }, [])

  const avgScore = Math.round(DEPARTMENTS.reduce((s, d) => s + Math.round(d.completed / d.total * 100), 0) / DEPARTMENTS.length)
  const best = [...DEPARTMENTS].sort((a, b) => (b.completed / b.total) - (a.completed / a.total))[0]
  const totalStaff = DEPARTMENTS.reduce((s, d) => s + d.members, 0)

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
      <div style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0a0f1e', margin: 0 }}>Department Performance</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>Task completion rate by team</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 40px' }}>
        {DEPARTMENTS.map((d, i) => {
          const pct = Math.round(d.completed / d.total * 100)
          return (
            <div key={d.name} style={{ opacity: animated ? 1 : 0, transform: animated ? 'none' : 'translateX(-8px)', transition: `opacity 0.4s ease ${i * 80}ms, transform 0.4s ease ${i * 80}ms` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${d.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e', margin: 0, lineHeight: 1.2 }}>{d.name}</p>
                    <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 500 }}>{d.members} members</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#0a0f1e' }}>{pct}%</span>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>{d.completed}/{d.total}</p>
                </div>
              </div>
              <div style={{ height: 7, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: animated ? `${pct}%` : '0%', background: `linear-gradient(90deg, ${d.color}, ${d.color}cc)`, borderRadius: 99, transition: `width 0.9s cubic-bezier(0.34,1.2,0.64,1) ${i * 80}ms`, boxShadow: `0 0 8px ${d.color}50` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, paddingTop: 20, marginTop: 20, borderTop: '1px solid #f8fafc' }}>
        {[
          { label: 'Best Team',   value: best.name, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Avg Score',   value: `${avgScore}%`, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
          { label: 'Total Staff', value: totalStaff, color: '#0d1b3e', bg: 'rgba(13,27,62,0.06)' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: 12, background: s.bg }}>
            <p style={{ fontSize: 16, fontWeight: 900, color: s.color, lineHeight: 1, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 5, fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
