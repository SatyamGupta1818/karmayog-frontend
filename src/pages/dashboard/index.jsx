/**
 * Dashboard/index.jsx — Redesigned with animations and polished layout
 * File: src/pages/dashboard/index.jsx
 */

import { useState, useEffect } from 'react'
import StatsCard             from './components/StatsCard'
import QuickStats            from './components/QuickStats'
import ProjectsOverview      from './components/ProjectsOverview'
import ProjectStatusChart    from './components/ProjectStatusChart'
import ProjectProgress       from './components/ProjectProgress'
import UserPerformance       from './components/UserPerformance'
import DepartmentPerformance from './components/DepartmentPerformance'
import RecentActivity        from './components/RecentActivity'
import UpcomingDeadlines     from './components/UpcomingDeadlines'

const KPI_CARDS = [
  { title: 'Total Projects', value: '40', subtitle: 'Across all departments', icon: 'FolderKanban',  trend: 12, trendLabel: 'vs last month', accent: 'navy',   delay: 0   },
  { title: 'Completed',      value: '18', subtitle: '45% completion rate',    icon: 'CheckCircle2', trend:  8, trendLabel: 'vs last month', accent: 'yellow', delay: 80  },
  { title: 'In Progress',    value: '12', subtitle: '4 high priority',         icon: 'Loader2',      trend: -2, trendLabel: 'vs last month', accent: 'teal',   delay: 160 },
  { title: 'Team Members',   value: '49', subtitle: 'Across 6 departments',   icon: 'Users',        trend:  5, trendLabel: 'New this month', accent: 'indigo', delay: 240 },
]

const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

export default function Dashboard() {
  const [headerVisible, setHeaderVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setHeaderVisible(true), 50); return () => clearTimeout(t) }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 32 }}>

      {/* ── Page Header ─────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        opacity: headerVisible ? 1 : 0,
        transform: headerVisible ? 'none' : 'translateY(-10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0a0f1e', margin: 0, letterSpacing: '-0.5px' }}>
            Good morning, Satyam 👋
          </h2>
          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 6, fontWeight: 500 }}>
            Here's what's happening at <strong style={{ color: '#0d1b3e' }}>Karmayog</strong> today.
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg,#fff,#f8fafc)',
          border: '1px solid #e2e8f0', borderRadius: 14,
          padding: '10px 18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>{today}</span>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {KPI_CARDS.map(card => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      {/* ── Quick Stats ─────────────────────────────────── */}
      <QuickStats />

      {/* ── Charts: Progress (2/3) + Status (1/3) ───────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <ProjectProgress />
        <ProjectStatusChart />
      </div>

      {/* ── Department Performance ───────────────────────── */}
      <DepartmentPerformance />

      {/* ── User Performance + Activity ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <UserPerformance />
        <RecentActivity />
      </div>

      {/* ── Projects Table ──────────────────────────────── */}
      <ProjectsOverview />

      {/* ── Deadlines ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <UpcomingDeadlines />
      </div>

    </div>
  )
}
