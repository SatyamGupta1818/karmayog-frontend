import { useEffect, useState } from 'react'
import { Loader2, UsersRound, X } from 'lucide-react'
import { toast } from '../../../components/common/Toast'

const EMPTY_FORM = {
  name: '',
  description: '',
  isActive: true,
}

export default function TeamFormModal({
  open,
  mode,
  team,
  department,
  saving,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    setForm({
      name: team?.name || '',
      description: team?.description || '',
      isActive: team?.isActive ?? true,
    })
  }, [open, team])

  if (!open) return null

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!department?.id) {
      toast.warning('Select Department', 'Please select a department before adding a team.')
      return
    }

    if (!form.name.trim()) {
      toast.warning('Validation Error', 'Team name is required.')
      return
    }

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      isActive: form.isActive,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-surface-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-surface-100 px-6 pb-4 pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
              <UsersRound size={19} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">
                {mode === 'create' ? 'Create Team' : 'Edit Team'}
              </h3>
              <p className="mt-0.5 text-xs text-ink-muted">
                {department?.name || 'Selected department'}
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

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              Team Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              placeholder="e.g. Frontend Team"
              className="w-full rounded-xl border border-surface-200 px-3 py-2.5 text-sm text-ink transition-all placeholder:text-ink-muted focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
              placeholder="Briefly describe this team..."
              rows={3}
              className="w-full resize-none rounded-xl border border-surface-200 px-3 py-2.5 text-sm text-ink transition-all placeholder:text-ink-muted focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <label className="flex items-center justify-between rounded-xl border border-surface-200 bg-surface-50 px-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-ink">Active Team</span>
              <span className="block text-xs text-ink-muted">Inactive teams remain visible.</span>
            </span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => handleChange('isActive', event.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-amber-500 focus:ring-amber-500"
            />
          </label>

          <div className="flex justify-end gap-2 border-t border-surface-100 pt-3">
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
              {mode === 'create' ? 'Create Team' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
