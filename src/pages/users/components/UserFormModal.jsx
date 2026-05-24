import { useEffect, useMemo, useState } from 'react'
import { Building2, Loader2, Shield, UsersRound, X } from 'lucide-react'
import { toast } from '../../../components/common/Toast'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  roleId: '',
  departmentId: '',
  teamIds: [],
  isActive: true,
}

export default function UserFormModal({
  open,
  mode,
  user,
  roles,
  departments,
  teams,
  saving,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      password: '',
      roleId: user?.roleId || '',
      departmentId: user?.departmentId || '',
      teamIds: user?.teamIds || [],
      isActive: user?.isActive ?? true,
    })
  }, [open, user])

  const departmentTeams = useMemo(() => {
    if (!form.departmentId) return []
    return teams.filter((team) => team.departmentId === form.departmentId)
  }, [form.departmentId, teams])

  if (!open) return null

  const handleChange = (field, value) => {
    setForm((previous) => {
      if (field === 'departmentId') {
        const allowedTeamIds = teams
          .filter((team) => team.departmentId === value)
          .map((team) => team.id)
        return {
          ...previous,
          departmentId: value,
          teamIds: previous.teamIds.filter((teamId) => allowedTeamIds.includes(teamId)),
        }
      }
      return { ...previous, [field]: value }
    })
  }

  const toggleTeam = (teamId) => {
    setForm((previous) => ({
      ...previous,
      teamIds: previous.teamIds.includes(teamId)
        ? previous.teamIds.filter((id) => id !== teamId)
        : [...previous.teamIds, teamId],
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.firstName.trim()) {
      toast.warning('Validation Error', 'First name is required.')
      return
    }
    if (!form.email.trim()) {
      toast.warning('Validation Error', 'Email is required.')
      return
    }
    if (mode === 'create' && !form.password.trim()) {
      toast.warning('Validation Error', 'Password is required for new users.')
      return
    }
    if (!form.roleId) {
      toast.warning('Validation Error', 'Please assign a role.')
      return
    }
    if (!form.departmentId) {
      toast.warning('Validation Error', 'Please assign a department.')
      return
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      roleId: form.roleId,
      departmentId: form.departmentId,
      teamIds: form.teamIds,
      isActive: form.isActive,
    }

    if (form.password.trim()) {
      payload.password = form.password.trim()
    }

    onSubmit(payload)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-6"
      onClick={() => !saving && onClose()}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-surface-100 px-6 pb-4 pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
              <UsersRound size={19} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">
                {mode === 'create' ? 'Create User' : 'Edit User'}
              </h3>
              <p className="mt-0.5 text-xs text-ink-muted">
                Assign role, department, and teams from one place.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-ink-muted transition-all hover:bg-surface-100 hover:text-ink disabled:opacity-50"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(92vh-86px)] overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">First Name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => handleChange('firstName', event.target.value)}
                placeholder="e.g. Satyam"
                className="w-full rounded-xl border border-surface-200 px-3 py-2.5 text-sm text-ink transition-all placeholder:text-ink-muted focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(event) => handleChange('lastName', event.target.value)}
                placeholder="e.g. Gupta"
                className="w-full rounded-xl border border-surface-200 px-3 py-2.5 text-sm text-ink transition-all placeholder:text-ink-muted focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-surface-200 px-3 py-2.5 text-sm text-ink transition-all placeholder:text-ink-muted focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
                Password {mode === 'create' ? '*' : ''}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => handleChange('password', event.target.value)}
                placeholder={mode === 'create' ? 'Temporary password' : 'Leave blank to keep current'}
                className="w-full rounded-xl border border-surface-200 px-3 py-2.5 text-sm text-ink transition-all placeholder:text-ink-muted focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                <Shield size={13} />
                Role *
              </label>
              <select
                value={form.roleId}
                onChange={(event) => handleChange('roleId', event.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm text-ink transition-all focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                <Building2 size={13} />
                Department *
              </label>
              <select
                value={form.departmentId}
                onChange={(event) => handleChange('departmentId', event.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm text-ink transition-all focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-surface-200 bg-surface-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                <UsersRound size={13} />
                Teams
              </label>
              <span className="text-xs text-ink-muted">{form.teamIds.length} selected</span>
            </div>

            {!form.departmentId ? (
              <p className="rounded-xl border border-surface-200 bg-white px-3 py-3 text-sm text-ink-muted">
                Select a department to choose teams.
              </p>
            ) : departmentTeams.length === 0 ? (
              <p className="rounded-xl border border-surface-200 bg-white px-3 py-3 text-sm text-ink-muted">
                No teams are available in the selected department.
              </p>
            ) : (
              <div className="grid max-h-52 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {departmentTeams.map((team) => (
                  <label
                    key={team.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition-all ${
                      form.teamIds.includes(team.id)
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-surface-200 bg-white hover:border-surface-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.teamIds.includes(team.id)}
                      onChange={() => toggleTeam(team.id)}
                      className="mt-0.5 h-4 w-4 rounded border-surface-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">{team.name}</span>
                      <span className="block truncate text-xs text-ink-muted">{team.description || 'No description'}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <label className="mt-5 flex items-center justify-between rounded-xl border border-surface-200 bg-white px-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-ink">Active User</span>
              <span className="block text-xs text-ink-muted">Inactive users remain visible.</span>
            </span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => handleChange('isActive', event.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-amber-500 focus:ring-amber-500"
            />
          </label>

          <div className="mt-5 flex justify-end gap-2 border-t border-surface-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all hover:shadow-lg disabled:opacity-70"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
