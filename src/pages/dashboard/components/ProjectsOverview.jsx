/**
 * ProjectsOverview.jsx — Projects table with polished rows and hover
 */

import { MoreHorizontal, ExternalLink, ArrowUpRight } from 'lucide-react'
import { useState, useEffect } from 'react'

const PROJECTS = [
  { id: 1, name: 'Karmayog Platform Redesign', dept: 'Engineering', status: 'In Progress', progress: 72,  due: '28 Apr 2026', priority: 'High',     assignees: ['P','A','D'], color: '#f59e0b' },
  { id: 2, name: 'HR Onboarding Module',        dept: 'HR',          status: 'Completed',   progress: 100, due: '10 Apr 2026', priority: 'Medium',   assignees: ['R','S'],     color: '#10b981' },
  { id: 3, name: 'Finance Reporting Q1',        dept: 'Finance',     status: 'Pending',     progress: 18,  due: '15 May 2026', priority: 'Low',      assignees: ['K'],         color: '#94a3b8' },
  { id: 4, name: 'Mobile App v2.0',             dept: 'Product',     status: 'In Progress', progress: 45,  due: '30 May 2026', priority: 'High',     assignees: ['M','N','O'], color: '#f59e0b' },
  { id: 5, name: 'Data Migration Sprint',       dept: 'Engineering', status: 'At Risk',     progress: 33,  due: '22 Apr 2026', priority: 'Critical', assignees: ['V','W'],     color: '#ef4444' },
]

const STATUS_STYLE = {
  'Completed':   { bg: 'rgba(16,185,129,0.1)',  color: '#059669', dot: '#10b981' },
  'In Progress': { bg: 'rgba(245,158,11,0.1)',  color: '#b45309', dot: '#f59e0b' },
  'Pending':     { bg: 'rgba(148,163,184,0.12)',color: '#64748b', dot: '#94a3b8' },
  'At Risk':     { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', dot: '#ef4444' },
}

const PRIORITY_STYLE = {
  'Critical': { bg: '#ef4444', color: '#fff' },
  'High':     { bg: '#f59e0b', color: '#fff' },
  'Medium':   { bg: '#3b82f6', color: '#fff' },
  'Low':      { bg: '#e2e8f0', color: '#64748b' },
}

const AVATAR_COLORS = ['#0d1b3e', '#f59e0b', '#10b981', '#6366f1', '#ec4899']

export default function ProjectsOverview() {
  const [hovered, setHovered] = useState(null)
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t) }, [])

  return (
    <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg,#fafafa,#fff)' }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0a0f1e', margin: 0 }}>All Projects</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>{PROJECTS.length} active projects</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '7px 14px', borderRadius: 10, cursor: 'pointer' }}>
          View All <ArrowUpRight size={13} />
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              {['Project', 'Department', 'Priority', 'Status', 'Progress', 'Due Date', 'Team', ''].map(h => (
                <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROJECTS.map((p, i) => {
              const ss = STATUS_STYLE[p.status]
              const ps = PRIORITY_STYLE[p.priority]
              const barColor = p.progress === 100 ? '#10b981' : p.progress < 40 ? '#ef4444' : '#f59e0b'
              const isHovered = hovered === i

              return (
                <tr key={p.id}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    borderBottom: '1px solid #f8fafc',
                    background: isHovered ? '#fafbff' : 'transparent',
                    opacity: animated ? 1 : 0,
                    transition: `opacity 0.4s ease ${i * 70}ms, background 0.2s ease`,
                    cursor: 'default',
                  }}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0, boxShadow: `0 0 6px ${p.color}80` }} />
                      <span style={{ fontWeight: 700, color: '#0a0f1e', whiteSpace: 'nowrap' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>{p.dept}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 9px', borderRadius: 7, background: ps.bg, color: ps.color, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{p.priority}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: ss.dot, boxShadow: `0 0 5px ${ss.dot}80` }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: ss.color, whiteSpace: 'nowrap' }}>{p.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 110 }}>
                      <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: animated ? `${p.progress}%` : '0%', background: `linear-gradient(90deg,${barColor}bb,${barColor})`, borderRadius: 99, transition: `width 0.9s cubic-bezier(0.34,1.2,0.64,1) ${i * 70}ms` }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#0a0f1e', width: 30, textAlign: 'right' }}>{p.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>{p.due}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex' }}>
                      {p.assignees.slice(0, 3).map((a, idx) => (
                        <div key={idx} style={{ width: 28, height: 28, borderRadius: 8, border: '2px solid #fff', background: AVATAR_COLORS[idx % AVATAR_COLORS.length], color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: idx > 0 ? -8 : 0, boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}>{a}</div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <button style={{ width: 30, height: 30, borderRadius: 8, background: isHovered ? '#f1f5f9' : 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'background 0.2s' }}>
                      <MoreHorizontal size={15} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
