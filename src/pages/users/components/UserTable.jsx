import { Building2, Loader2, Mail, Pencil, Power, Shield, Trash2, UsersRound } from 'lucide-react'
import PermissionGuard from '../../../components/common/PermissionGuard'
import StatusBadge from './StatusBadge'

const initialsFor = (user) => {
  const first = user.firstName?.[0] || ''
  const last = user.lastName?.[0] || ''
  return `${first}${last}`.toUpperCase() || 'U'
}

export default function UserTable({
  users,
  loading,
  updatingId,
  editingId,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-surface-100 bg-surface-100/50 px-5 py-3.5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Users ({users.length})</p>
          <p className="mt-0.5 text-[11px] text-ink-muted">Manage profile access and assignments.</p>
        </div>
        <UsersRound size={17} className="text-ink-muted" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="min-w-[260px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                User
              </th>
              <th className="min-w-[150px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Role
              </th>
              <th className="min-w-[220px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Assignment
              </th>
              <th className="w-28 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Status
              </th>
              <th className="w-32 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <Loader2 size={24} className="mx-auto mb-2 animate-spin text-amber-500" />
                  <p className="text-sm text-ink-muted">Loading users...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <UsersRound size={26} className="mx-auto mb-3 text-ink-muted" />
                  <p className="text-sm font-medium text-ink">No users found</p>
                  <p className="mt-1 text-xs text-ink-muted">Create a user or adjust the filters.</p>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const updating = updatingId === user.id
                const editing = editingId === user.id

                return (
                  <tr key={user.id} className="border-b border-surface-100 transition-colors last:border-0 hover:bg-surface-100/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow-sm shadow-amber-500/20">
                          {initialsFor(user)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{user.fullName}</p>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                            <Mail size={12} />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">
                        <Shield size={13} />
                        {user.roleName || 'Not assigned'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-ink-muted">
                          <Building2 size={13} />
                          <span className="font-medium text-ink">{user.departmentName || 'No department'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {user.teamNames.length > 0 ? (
                            user.teamNames.slice(0, 3).map((teamName) => (
                              <span key={teamName} className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                <UsersRound size={11} />
                                {teamName}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-ink-muted">No teams</span>
                          )}
                          {user.teamNames.length > 3 && (
                            <span className="rounded-lg border border-surface-200 bg-surface-100 px-2 py-1 text-[11px] font-semibold text-ink-muted">
                              +{user.teamNames.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge active={user.isActive} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <PermissionGuard permission="users.UPDATE">
                          <button
                            type="button"
                            onClick={() => onToggleStatus(user)}
                            disabled={updating}
                            className="rounded-lg p-2 text-ink-muted transition-all hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                            title={user.isActive ? 'Mark inactive' : 'Mark active'}
                          >
                            {updating ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(user)}
                            disabled={editing}
                            className="rounded-lg p-2 text-ink-muted transition-all hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50"
                            title="Edit user"
                          >
                            {editing ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="users.DELETE">
                          <button
                            type="button"
                            onClick={() => onDelete(user)}
                            className="rounded-lg p-2 text-ink-muted transition-all hover:bg-red-50 hover:text-red-600"
                            title="Delete user"
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
    </div>
  )
}
