/**
 * QuickStats.jsx — Animated quick stat pills
 */

import { Target, Flame, Clock3, Star } from 'lucide-react'
import { useState, useEffect } from 'react'

const STATS = [
  { label: 'Sprint Velocity', value: '34 pts',  icon: Target, color: '#6366f1', bg: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(99,102,241,0.06))', border: 'rgba(99,102,241,0.2)' },
  { label: 'Active Streak',   value: '12 days', icon: Flame,  color: '#ef4444', bg: 'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(239,68,68,0.06))', border: 'rgba(239,68,68,0.2)' },
  { label: 'Avg Cycle Time',  value: '3.2 days',icon: Clock3, color: '#f59e0b', bg: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.06))', border: 'rgba(245,158,11,0.2)' },
  { label: 'Satisfaction',    value: '4.7 / 5', icon: Star,   color: '#10b981', bg: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.06))', border: 'rgba(16,185,129,0.2)' },
]

export default function QuickStats() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 200); return () => clearTimeout(t) }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
      {STATS.map((s, i) => {
        const Icon = s.icon
        return (
          <div key={s.label} style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: 16,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            transform: visible ? 'translateY(0)' : 'translateY(14px)',
            opacity: visible ? 1 : 0,
            transition: `transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms, opacity 0.35s ease ${i * 80}ms`,
            cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${s.color}40` }}>
              <Icon size={20} color="#fff" strokeWidth={1.75} />
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 900, color: '#0a0f1e', lineHeight: 1, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>{s.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
