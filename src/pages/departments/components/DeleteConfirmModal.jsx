import { AlertTriangle, Loader2 } from 'lucide-react'

export default function DeleteConfirmModal({
  open,
  title,
  itemName,
  description,
  loading,
  onCancel,
  onConfirm,
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={() => !loading && onCancel()}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-surface-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 pb-4 pt-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">{title}</h3>
              <p className="text-xs text-ink-muted">This action cannot be undone.</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-ink-muted">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-ink">"{itemName}"</span>?
          </p>
          {description && (
            <p className="mt-2 text-xs leading-5 text-ink-muted">{description}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 pb-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-70"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
