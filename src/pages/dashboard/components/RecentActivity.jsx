/**
 * RecentActivity.jsx — Animated timeline feed
 */

import { CheckCircle2, PlusCircle, AlertCircle, UserPlus, MessageSquare, GitBranch } from 'lucide-react'
import { useState, useEffect } from 'react'

const ACTIVITIES = [
  { id: 1, message: 'Priya Sharma completed task',     detail: 'API Integration — Auth Module',   time: '2m ago',  Icon: CheckCircle2,  iconColor: '#10b981', iconBg: 'rgba(16,185,129,0.12)'  },
  { id: 2, message: 'Arjun Mehta created a new Epic',  detail: 'Mobile App v2.0 — Phase 2',       time: '18m ago', Icon: PlusCircle,    iconColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.12)'  },
  { id: 3, message: '"Data Migration" is at risk',     detail: 'Deadline in 2 days — 33% done',   time: '45m ago', Icon: AlertCircle,   iconColor: '#ef4444', iconBg: 'rgba(239,68,68,0.12)'   },
  { id: 4, message: 'New user added to Engineering',   detail: 'Rahul Verma — Junior Developer',  time: '1h ago',  Icon: UserPlus,      iconColor: '#6366f1', iconBg: 'rgba(99,102,241,0.1)'   },
  { id: 5, message: 'Sneha Iyer commented on Story',   detail: 'Needs clarification on scope',    time: '2h ago',  Icon: MessageSquare, iconColor: '#0d1b3e', iconBg: 'rgba(13,27,62,0.08)'    },
  { id: 6, message: 'Sprint 14 was kicked off',        detail: 'Karmayog Platform Redesign',      time: '3h ago',  Icon: GitBranch,     iconColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.12)'  },
]

export default function RecentActivity() {
  const [visible, setVisible] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(v => { if (v < ACTIVITIES.length) return v + 1; clearInterval(interval); return v })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0a0f1e', margin: 0 }}>Recent Activity</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>Latest platform updates</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {ACTIVITIES.map((a, i) => {
          const { Icon } = a
          return (
            <div key={a.id} style={{ display: 'flex', gap: 12, opacity: i < visible ? 1 : 0, transform: i < visible ? 'none' : 'translateY(6px)', transition: 'opacity 0.35s ease, transform 0.35s ease' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: 11, background: a.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${a.iconColor}20` }}>
                  <Icon size={15} color={a.iconColor} strokeWidth={1.75} />
                </div>
                {i < ACTIVITIES.length - 1 && (
                  <div style={{ width: 1.5, flex: 1, background: 'linear-gradient(to bottom,#f1f5f9,transparent)', marginTop: 4, marginBottom: 4, minHeight: 12 }} />
                )}
              </div>
              <div style={{ flex: 1, paddingBottom: i < ACTIVITIES.length - 1 ? 14 : 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', margin: 0, lineHeight: 1.5 }}>{a.message}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>{a.detail}</p>
                <span style={{ fontSize: 10, color: '#cbd5e1', marginTop: 4, display: 'inline-block', fontWeight: 600, background: '#f8fafc', padding: '2px 7px', borderRadius: 6 }}>{a.time}</span>
              </div>
            </div>
          )
        })}
      </div>

      <button style={{
        width: '100%', marginTop: 16, padding: '10px 0', fontSize: 12, fontWeight: 700, color: '#f59e0b',
        background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(249,115,22,0.06))',
        border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, cursor: 'pointer',
        transition: 'background 0.2s ease',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg,rgba(245,158,11,0.14),rgba(249,115,22,0.1))'}
        onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(249,115,22,0.06))'}
      >
        View all activity →
      </button>
    </div>
  )
}
