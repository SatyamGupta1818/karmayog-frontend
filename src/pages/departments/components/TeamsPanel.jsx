import {
  Building2,
  Loader2,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Trash2,
  UsersRound,
} from 'lucide-react'
import PermissionGuard from '../../../components/common/PermissionGuard'
import StatusBadge from './StatusBadge'

export default function TeamsPanel({
  department,
  teams,
  filteredTeams,
  search,
  loading,
  updatingId,
  onSearchChange,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
  onToggleStatus,
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
      <div className="flex flex-col gap-4 border-b border-surface-100 bg-surface-100/50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Teams
          </p>
          <div className="mt-1 flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-ink">
              {department?.name || 'Select a department'}
            </h3>
            {department && <StatusBadge active={department.isActive} />}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={!department || loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200 bg-white text-ink-muted shadow-sm transition-all hover:text-ink disabled:opacity-50"
            title="Refresh teams"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <PermissionGuard permission="departments.CREATE">
            <button
              type="button"
              onClick={onCreate}
              disabled={!department}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-60"
            >
              <Plus size={16} />
              Add Team
            </button>
          </PermissionGuard>
        </div>
      </div>

      {!department ? (
        <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100">
            <Building2 size={28} className="text-ink-muted" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Select a department</p>
            <p className="mt-1 text-xs text-ink-muted">Teams are managed inside their department.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 border-b border-surface-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search teams..."
                className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink shadow-sm transition-all placeholder:text-ink-muted focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <p className="text-xs text-ink-muted">
              Showing <span className="font-semibold text-ink">{filteredTeams.length}</span> of{' '}
              <span className="font-semibold text-ink">{teams.length}</span> teams
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="min-w-[260px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Team
                  </th>
                  <th className="w-28 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Status
                  </th>
                  <th className="w-28 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center">
                      <Loader2 size={24} className="mx-auto mb-2 animate-spin text-amber-500" />
                      <p className="text-sm text-ink-muted">Loading teams...</p>
                    </td>
                  </tr>
                ) : filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <UsersRound size={26} className="mx-auto mb-3 text-ink-muted" />
                      <p className="text-sm font-medium text-ink">
                        {search ? 'No teams match your search' : 'No teams in this department'}
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {search ? 'Try another search term.' : 'Add the first team when you are ready.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team) => {
                    const updating = updatingId === team.id

                    return (
                      <tr
                        key={team.id}
                        className="border-b border-surface-100 transition-colors last:border-0 hover:bg-surface-100/30"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                              <UsersRound size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink">{team.name}</p>
                              <p className="text-[11px] text-ink-muted">{department.name}</p>
                              <p className="mt-1 line-clamp-2 max-w-md text-xs leading-5 text-ink-muted">
                                {team.description || 'No description'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge active={team.isActive} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <PermissionGuard permission="departments.UPDATE">
                              <button
                                type="button"
                                onClick={() => onToggleStatus(team)}
                                disabled={updating}
                                className="rounded-lg p-2 text-ink-muted transition-all hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                                title={team.isActive ? 'Mark inactive' : 'Mark active'}
                              >
                                {updating ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Power size={14} />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => onEdit(team)}
                                className="rounded-lg p-2 text-ink-muted transition-all hover:bg-amber-50 hover:text-amber-600"
                                title="Edit team"
                              >
                                <Pencil size={14} />
                              </button>
                            </PermissionGuard>
                            <PermissionGuard permission="departments.DELETE">
                              <button
                                type="button"
                                onClick={() => onDelete(team)}
                                className="rounded-lg p-2 text-ink-muted transition-all hover:bg-red-50 hover:text-red-600"
                                title="Delete team"
                              >
                                <Trash2 size={14} />
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
        </>
      )}
    </div>
  )
}
