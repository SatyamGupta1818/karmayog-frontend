import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Loader2, Plus, X } from 'lucide-react'
import { toast } from '../../../components/common/Toast'

const STATUS_OPTIONS = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
]

const EMPTY_FORM = {
  name: '',
  description: '',
  status: 'PLANNING',
  startDate: '',
  endDate: '',
  budgetMinutes: 0,
  departmentId: '',
  teamIds: [],
  memberIds: [],
}

const normalizeEntityName = (entity) =>
  entity?.name || `${entity?.firstName || ''} ${entity?.lastName || ''}`.trim() || entity?.email || 'Unknown'

const normalizeArrayValue = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

export default function ProjectFormModal({
  open,
  mode,
  project,
  saving,
  onClose,
  onSubmit,
  departments = [],
  teams = [],
  users = [],
}) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    setForm({
      name: project?.name || '',
      description: project?.description || '',
      status: project?.status || 'PLANNING',
      startDate: project?.startDate ? String(project.startDate).slice(0, 10) : '',
      endDate: project?.endDate ? String(project.endDate).slice(0, 10) : '',
      budgetMinutes: Number(project?.budgetMinutes || 0),
      departmentId: project?.departmentId || '',
      teamIds: normalizeArrayValue(project?.teamIds),
      memberIds: normalizeArrayValue(project?.memberIds),
    })
  }, [open, project])

  const availableTeams = useMemo(() => {
    if (!form.departmentId) return teams
    return teams.filter((team) => String(team.departmentId || team.department_id || '').trim() === String(form.departmentId).trim())
  }, [form.departmentId, teams])

  const toggleSelection = (field, id) => {
    setForm((previous) => {
      const list = Array.isArray(previous[field]) ? [...previous[field]] : []
      const idx = list.indexOf(id)
      if (idx === -1) list.push(id)
      else list.splice(idx, 1)
      return { ...previous, [field]: list }
    })
  }

  const removeFromSelection = (field, id) => {
    setForm((previous) => ({ ...previous, [field]: (previous[field] || []).filter((x) => x !== id) }))
  }

  if (!open) return null

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.name.trim()) {
      toast.warning('Validation Error', 'Project name is required.')
      return
    }
    if (form.startDate && form.endDate && new Date(form.endDate).getTime() < new Date(form.startDate).getTime()) {
      toast.warning('Validation Error', 'End date cannot be before start date.')
      return
    }
    if (Number(form.budgetMinutes) < 0) {
      toast.warning('Validation Error', 'Budget minutes must be zero or positive.')
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      budgetMinutes: Number(form.budgetMinutes || 0),
      departmentId: form.departmentId || undefined,
      teamIds: form.teamIds.length > 0 ? form.teamIds : undefined,
      memberIds: form.memberIds.length > 0 ? form.memberIds : undefined,
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200 bg-blue-50 text-blue-600">
              <Plus size={19} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">
                {mode === 'create' ? 'Create Project' : 'Edit Project'}
              </h3>
              <p className="mt-0.5 text-xs text-ink-muted">
                Use the form below to add or update a project.
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
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Project Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="Enter project name"
                className="w-full rounded-xl border border-surface-200 px-3 py-2.5 text-sm text-ink transition-all placeholder:text-ink-muted focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Status</label>
              <select
                value={form.status}
                onChange={(event) => handleChange('status', event.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm text-ink transition-all focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
              rows={5}
              placeholder="Provide a short description of the project"
              className="w-full rounded-2xl border border-surface-200 px-3 py-3 text-sm text-ink transition-all placeholder:text-ink-muted focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Department</label>
              <select
                value={form.departmentId}
                onChange={(event) => handleChange('departmentId', event.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm text-ink transition-all focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select department</option>
                {form.departmentId && !departments.find((d) => d.id === form.departmentId) && (
                  <option value={form.departmentId}>
                    {project?.raw?.department?.name || form.departmentId}
                  </option>
                )}
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(event) => handleChange('startDate', event.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm text-ink transition-all focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(event) => handleChange('endDate', event.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm text-ink transition-all focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Budget Minutes</label>
              <input
                type="number"
                min="0"
                value={form.budgetMinutes}
                onChange={(event) => handleChange('budgetMinutes', event.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm text-ink transition-all focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Teams</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.teamIds.map((tid) => {
                  const t = teams.find((x) => x.id === tid) || { id: tid, name: tid }
                  return (
                    <span key={tid} className="inline-flex items-center gap-2 rounded-full bg-surface-100 px-3 py-1 text-sm">
                      <span className="truncate max-w-[10rem]">{t.name}</span>
                      <button type="button" onClick={() => removeFromSelection('teamIds', tid)} className="text-ink-muted hover:text-ink">✕</button>
                    </span>
                  )
                })}
              </div>
              <div className="mt-2 h-44 overflow-auto rounded-2xl border border-surface-200 bg-white p-2">
                {availableTeams.map((team) => (
                  <label key={team.id} className="flex items-center gap-2 p-2 hover:bg-surface-50 rounded">
                    <input type="checkbox" checked={form.teamIds.includes(team.id)} onChange={() => toggleSelection('teamIds', team.id)} className="h-4 w-4" />
                    <span className="text-sm">{team.name}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-muted">Select teams (filtered by department).</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Members</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.memberIds.map((mid) => {
                  const u = users.find((x) => x.id === mid) || { id: mid, name: mid }
                  return (
                    <span key={mid} className="inline-flex items-center gap-2 rounded-full bg-surface-100 px-3 py-1 text-sm">
                      <span className="truncate max-w-[10rem]">{u.name}</span>
                      <button type="button" onClick={() => removeFromSelection('memberIds', mid)} className="text-ink-muted hover:text-ink">✕</button>
                    </span>
                  )
                })}
              </div>
              <div className="mt-2 h-44 overflow-auto rounded-2xl border border-surface-200 bg-white p-2">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-surface-50 rounded">
                    <input type="checkbox" checked={form.memberIds.includes(user.id)} onChange={() => toggleSelection('memberIds', user.id)} className="h-4 w-4" />
                    <span className="text-sm">{normalizeEntityName(user)}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-muted">Select project members.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-70"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving...' : mode === 'create' ? 'Create project' : 'Save changes'}
            </button>
          </div>
        </form>

        {saving && (
          <div className="absolute inset-x-0 bottom-0 left-0 border-t border-surface-100 bg-white/70 px-6 py-3 text-xs text-ink-muted">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} />
              Saving project changes, please wait...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
