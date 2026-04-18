/**
 * UpcomingDeadlines.jsx — Deadline cards with urgency colors
 */

import { Calendar, AlertTriangle, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

const DEADLINES = [
  { id: 1, title: 'Data Migration Sprint', type: 'Project', daysLeft: 2,  progress: 33, urgent: true  },
  { id: 2, title: 'Q1 Finance Report',     type: 'Task',    daysLeft: 4,  progress: 60, urgent: true  },
  { id: 3, title: 'Platform Redesign',     type: 'Project', daysLeft: 10, progress: 72, urgent: false },
  { id: 4, title: 'HR Onboarding v2',      type: 'Epic',    daysLeft: 14, progress: 45, urgent: false },
  { id: 5, title: 'Mobile App Beta',       type: 'Project', daysLeft: 18, progress: 55, urgent: false },
]

function getUrgency(d) {
  if (d <= 3) return { bar: '#ef4444', badge: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626' }, dot: '#ef4444', cardBg: 'rgba(239,68,68,0.03)' }
  if (d <= 7) return { bar: '#f59e0b', badge: { bg: 'rgba(245,158,11,0.1)', color: '#b45309' }, dot: '#f59e0b', cardBg: 'rgba(245,158,11,0.03)' }
  return        { bar: '#0d1b3e', badge: { bg: 'rgba(13,27,62,0.07)',   color: '#475569' }, dot: '#94a3b8', cardBg: 'transparent' }
}

export default function UpcomingDeadlines() {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t) }, [])

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0a0f1e', margin: 0 }}>Upcoming Deadlines</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>Next 3 weeks</p>
        </div>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(13,27,62,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Calendar size={15} color="#64748b" />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DEADLINES.map((d, i) => {
          const u = getUrgency(d.daysLeft)
          return (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14,
              background: u.cardBg, border: '1px solid #f1f5f9',
              opacity: animated ? 1 : 0,
              transform: animated ? 'none' : 'translateX(-8px)',
              transition: `opacity 0.4s ease ${i * 80}ms, transform 0.4s ease ${i * 80}ms`,
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0' }}
              onMouseLeave={e => { e.currentTarget.style.background = u.cardBg; e.currentTarget.style.borderColor = '#f1f5f9' }}
            >
              {/* Dot */}
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: u.dot, flexShrink: 0, boxShadow: `0 0 6px ${u.dot}60` }} />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#0a0f1e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</p>
                  {d.urgent && <AlertTriangle size={11} color="#f59e0b" style={{ flexShrink: 0 }} />}
                </div>
                <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: animated ? `${d.progress}%` : '0%', background: `linear-gradient(90deg,${u.bar}99,${u.bar})`, borderRadius: 99, transition: `width 0.8s cubic-bezier(0.34,1.2,0.64,1) ${i * 80}ms` }} />
                </div>
              </div>

              {/* Badge */}
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 9px', borderRadius: 8, background: u.badge.bg, color: u.badge.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={10} />
                  {d.daysLeft}d
                </span>
                <span style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginTop: 4, fontWeight: 500 }}>{d.type}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
