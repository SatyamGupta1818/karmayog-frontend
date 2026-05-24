import {
  Building2,
  CheckCircle2,
  Loader2,
  Pencil,
  Power,
  Trash2,
  UsersRound,
} from 'lucide-react'
import PermissionGuard from '../../../components/common/PermissionGuard'
import StatusBadge from './StatusBadge'

export default function DepartmentList({
  departments,
  selectedDepartmentId,
  teamCounts,
  loading,
  updatingId,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-surface-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-surface-100 bg-surface-100/50 px-5 py-3.5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Departments ({departments.length})
          </p>
          <p className="mt-0.5 text-[11px] text-ink-muted">Select one to manage teams.</p>
        </div>
        <Building2 size={17} className="text-ink-muted" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-14">
          <Loader2 size={24} className="animate-spin text-amber-500" />
          <p className="text-sm text-ink-muted">Loading departments...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Building2 size={26} className="text-ink-muted" />
          <div>
            <p className="text-sm font-medium text-ink">No departments found</p>
            <p className="mt-1 text-xs text-ink-muted">Create a department to start adding teams.</p>
          </div>
        </div>
      ) : (
        <div className="max-h-[64vh] divide-y divide-surface-100 overflow-y-auto">
          {departments.map((department) => {
            const selected = department.id === selectedDepartmentId
            const teamCount = teamCounts[department.id] || 0
            const updating = updatingId === department.id

            return (
              <div
                role="button"
                tabIndex={0}
                key={department.id}
                onClick={() => onSelect(department.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelect(department.id)
                  }
                }}
                className={`block w-full border-l-2 px-5 py-4 text-left transition-all hover:bg-surface-100/50 ${
                  selected ? 'border-l-amber-500 bg-amber-50/40' : 'border-l-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      selected
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                        : 'bg-surface-100 text-ink-muted'
                    }`}
                  >
                    {selected ? <CheckCircle2 size={17} /> : <Building2 size={17} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-ink">{department.name}</p>
                      <StatusBadge active={department.isActive} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-muted">
                      {department.description || 'No description'}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
                      <UsersRound size={13} />
                      <span>
                        {teamCount} {teamCount === 1 ? 'team' : 'teams'}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1" onClick={(event) => event.stopPropagation()}>
                    <PermissionGuard permission="departments.UPDATE">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(department)}
                        disabled={updating}
                        className="rounded-lg p-1.5 text-ink-muted transition-all hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                        title={department.isActive ? 'Mark inactive' : 'Mark active'}
                      >
                        {updating ? <Loader2 size={13} className="animate-spin" /> : <Power size={13} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(department)}
                        className="rounded-lg p-1.5 text-ink-muted transition-all hover:bg-amber-50 hover:text-amber-600"
                        title="Edit department"
                      >
                        <Pencil size={13} />
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission="departments.DELETE">
                      <button
                        type="button"
                        onClick={() => onDelete(department)}
                        className="rounded-lg p-1.5 text-ink-muted transition-all hover:bg-red-50 hover:text-red-600"
                        title="Delete department"
                      >
                        <Trash2 size={13} />
                      </button>
                    </PermissionGuard>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
