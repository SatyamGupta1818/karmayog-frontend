import StatsCard from '../../dashboard/components/StatsCard'
import { Calendar } from 'lucide-react'

export default function ProjectSummary({ projects = [], total = 0, departments = [], teams = [], users = [], onRefresh }) {
  const totalProjects = total || projects.length
  const active = projects.filter((p) => String(p.status).toUpperCase() === 'ACTIVE').length
  const planning = projects.filter((p) => String(p.status).toUpperCase() === 'PLANNING').length
  const completed = projects.filter((p) => String(p.status).toUpperCase() === 'COMPLETED').length

  const departmentSet = new Set(projects.map((p) => p.departmentId).filter(Boolean))
  const departmentCount = Math.max(departmentSet.size, (departments || []).length || 0)

  const teamSet = new Set()
  projects.forEach((p) => {
    const list = p.raw?.teams || []
    list.forEach((t) => teamSet.add(t?.id || t?.teamId || t?.name))
  })
  const teamCount = Math.max(teamSet.size, (teams || []).length || 0)

  const memberSet = new Set()
  projects.forEach((p) => {
    const list = p.raw?.members || []
    list.forEach((m) => memberSet.add(m?.id || m?.userId || m?.email))
  })
  const memberCount = Math.max(memberSet.size, (users || []).length || 0)

  const now = new Date()
  const upcoming = projects
    .filter((p) => p.endDate)
    .map((p) => {
      const end = new Date(p.endDate)
      const daysLeft = Number.isFinite(end.getTime()) ? Math.ceil((end - now) / (1000 * 60 * 60 * 24)) : null
      return { id: p.id, name: p.name, endDate: p.endDate, daysLeft }
    })
    .filter((x) => x.daysLeft !== null)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(320px,420px)]">
      <div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Projects" value={totalProjects} subtitle={`${departmentCount} departments`} icon="Folder" accent="indigo" delay={80} />
          <StatsCard title="Active" value={active} subtitle={`${teamCount} teams`} icon="Play" accent="teal" delay={160} />
          <StatsCard title="Planning" value={planning} subtitle={`${memberCount} members`} icon="Clock" accent="yellow" delay={240} />
          <StatsCard title="Completed" value={completed} subtitle="Completed projects" icon="CheckCircle" accent="navy" delay={320} />
        </div>
      </div>

      <div>
        <div className="rounded-2xl border border-surface-200 bg-white px-4 py-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">Upcoming Deadlines</h3>
              <p className="mt-0.5 text-[11px] text-ink-muted">Next projects approaching end date</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
              <Calendar size={14} className="text-ink-muted" />
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {upcoming.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-ink-muted">No upcoming deadlines</div>
            ) : (
              upcoming.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 rounded-md border border-surface-100 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{u.name}</p>
                    <p className="text-xs text-ink-muted">Ends in {u.daysLeft} day{u.daysLeft !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-sm font-semibold text-ink-muted">{u.daysLeft}d</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
