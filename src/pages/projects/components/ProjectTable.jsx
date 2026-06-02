import { ArrowRight, Loader2, Trash2 } from 'lucide-react'
import PermissionGuard from '../../../components/common/PermissionGuard'

const statusStyles = {
  PLANNING: 'bg-blue-50 text-blue-700 border-blue-100',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  COMPLETED: 'bg-slate-50 text-slate-700 border-slate-200',
}

const getStatusClass = (status) => {
  return statusStyles[status] || 'bg-surface-100 text-ink-muted border-surface-200'
}

export default function ProjectTable({
  projects,
  total,
  loading,
  deletingId,
  onView,
  onDelete,
}) {
  const formatDate = (value) => {
    if (!value) return '-' 
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleDateString()
  }
  const formatMinutes = (value) => {
    const minutes = Number(value) || 0
    const hours = Math.floor(minutes / 60)
    const remaining = minutes % 60
    if (hours > 0 && remaining > 0) return `${hours}h ${remaining}m`
    if (hours > 0) return `${hours}h`
    return `${remaining}m`
  }
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-surface-100 bg-surface-100/50 px-5 py-3.5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Projects ({typeof total === 'number' ? total : projects.length})</p>
          <p className="mt-0.5 text-[11px] text-ink-muted">Manage your active and planning initiatives.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="min-w-[200px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Project</th>
              <th className="min-w-[220px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Department</th>
              <th className="min-w-[320px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Description</th>
              <th className="w-28 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Status</th>
              <th className="w-24 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Start</th>
              <th className="w-24 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">End</th>
              <th className="w-28 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Budget</th>
              <th className="min-w-[160px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Owner</th>
              <th className="w-32 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <Loader2 size={24} className="mx-auto mb-2 animate-spin text-amber-500" />
                  <p className="text-sm text-ink-muted">Loading projects...</p>
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-ink">No projects found</p>
                  <p className="mt-1 text-xs text-ink-muted">Create a new project or adjust the filters.</p>
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const isDeleting = deletingId === project.id

                return (
                  <tr
                    key={project.id}
                    className="border-b border-surface-100 transition-colors last:border-0 hover:bg-surface-100/30 cursor-pointer"
                    onClick={() => onView?.(project)}
                  >
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{project.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-ink-muted">{project.departmentName || '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="line-clamp-2 text-sm text-ink-muted">{project.description || 'No description provided.'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${getStatusClass(project.status)}`}>
                        {project.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-ink-muted">{formatDate(project.startDate)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-ink-muted">{formatDate(project.endDate)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-ink-muted">{formatMinutes(project.budgetMinutes)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-ink-muted">{project.owner || '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onView?.(project)
                          }}
                          className="rounded-lg p-2 text-ink-muted transition-all hover:bg-amber-50 hover:text-amber-600"
                          title="Open project"
                        >
                          <ArrowRight size={14} />
                        </button>
                        <PermissionGuard permission="project.DELETE">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onDelete(project)
                            }}
                            className="rounded-lg p-2 text-ink-muted transition-all hover:bg-red-50 hover:text-red-600"
                            title="Delete project"
                          >
                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
