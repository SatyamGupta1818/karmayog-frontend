/**
 * UserPerformance.jsx — Ranked user table with animated score bars
 */

import { Award, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useState, useEffect } from 'react'

const USERS = [
  { rank: 1, name: 'Priya Sharma',  dept: 'Engineering', avatar: 'PS', tasks: 47, completed: 45, score: 96, trend: 'up'   },
  { rank: 2, name: 'Arjun Mehta',   dept: 'Product',     avatar: 'AM', tasks: 39, completed: 36, score: 92, trend: 'up'   },
  { rank: 3, name: 'Divya Nair',    dept: 'Design',      avatar: 'DN', tasks: 34, completed: 31, score: 91, trend: 'same' },
  { rank: 4, name: 'Rohan Gupta',   dept: 'HR',          avatar: 'RG', tasks: 28, completed: 24, score: 86, trend: 'down' },
  { rank: 5, name: 'Sneha Iyer',    dept: 'Finance',     avatar: 'SI', tasks: 31, completed: 26, score: 84, trend: 'up'   },
  { rank: 6, name: 'Karan Joshi',   dept: 'Engineering', avatar: 'KJ', tasks: 22, completed: 18, score: 82, trend: 'down' },
]

const RANK_EMOJIS = ['🥇', '🥈', '🥉']
const AVATAR_COLORS = ['#0d1b3e', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#f97316']

export default function UserPerformance() {
  const [animated, setAnimated] = useState(false)
  const [hovered, setHovered] = useState(null)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t) }, [])

  return (
    <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg,#fafafa,#fff)' }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0a0f1e', margin: 0 }}>User Performance</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>Ranked by task completion score</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(249,115,22,0.08))', color: '#b45309', fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 12, border: '1px solid rgba(245,158,11,0.2)' }}>
          <Award size={13} />
          This Month
        </div>
      </div>

      {/* Rows */}
      {USERS.map((u, i) => {
        const avatarBg = AVATAR_COLORS[i % AVATAR_COLORS.length]
        const scoreColor = u.score >= 90 ? '#10b981' : u.score >= 80 ? '#f59e0b' : '#ef4444'
        const isHovered = hovered === i

        return (
          <div key={u.rank}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '13px 24px',
              borderBottom: i < USERS.length - 1 ? '1px solid #f8fafc' : 'none',
              background: isHovered ? '#fafbff' : 'transparent',
              opacity: animated ? 1 : 0,
              transform: animated ? 'none' : 'translateX(-10px)',
              transition: `opacity 0.4s ease ${i * 60}ms, transform 0.4s ease ${i * 60}ms, background 0.2s ease`,
              cursor: 'default',
            }}
          >
            {/* Rank */}
            <div style={{ width: 26, textAlign: 'center', flexShrink: 0 }}>
              {u.rank <= 3
                ? <span style={{ fontSize: 16 }}>{RANK_EMOJIS[u.rank - 1]}</span>
                : <span style={{ fontSize: 12, fontWeight: 800, color: '#cbd5e1' }}>#{u.rank}</span>
              }
            </div>

            {/* Avatar */}
            <div style={{ width: 38, height: 38, borderRadius: 12, background: avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, flexShrink: 0, boxShadow: `0 4px 10px ${avatarBg}40` }}>
              {u.avatar}
            </div>

            {/* Name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: 500 }}>{u.dept}</p>
            </div>

            {/* Tasks */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#0a0f1e', margin: 0 }}>{u.completed}/{u.tasks}</p>
              <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>Tasks</p>
            </div>

            {/* Score bar */}
            <div style={{ width: 110, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: animated ? `${u.score}%` : '0%', background: `linear-gradient(90deg,${scoreColor}cc,${scoreColor})`, borderRadius: 99, transition: `width 0.9s cubic-bezier(0.34,1.2,0.64,1) ${i * 80}ms` }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: scoreColor, width: 24, textAlign: 'right' }}>{u.score}</span>
              </div>
            </div>

            {/* Trend */}
            <div style={{ flexShrink: 0, width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {u.trend === 'up'   && <TrendingUp   size={14} color="#10b981" />}
              {u.trend === 'down' && <TrendingDown  size={14} color="#ef4444" />}
              {u.trend === 'same' && <Minus         size={14} color="#cbd5e1" />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
