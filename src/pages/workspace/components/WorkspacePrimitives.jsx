import * as Icons from 'lucide-react'
import { Loader2, Search, X } from 'lucide-react'
import PermissionGuard from '../../../components/common/PermissionGuard'

export function WorkspacePageHeader({
  title,
  description,
  actionLabel,
  actionIcon = 'Plus',
  onAction,
  actionPermission,
  meta,
}) {
  const ActionIcon = Icons[actionIcon] || Icons.Plus

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        {meta && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-600">{meta}</p>
        )}
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm text-ink-muted">{description}</p>}
      </div>
      {actionLabel && (
        actionPermission ? (
          <PermissionGuard permission={actionPermission}>
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/15 transition hover:bg-blue-700 disabled:opacity-60"
            >
              <ActionIcon size={16} />
              {actionLabel}
            </button>
          </PermissionGuard>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/15 transition hover:bg-blue-700 disabled:opacity-60"
          >
            <ActionIcon size={16} />
            {actionLabel}
          </button>
        )
      )}
    </div>
  )
}

export function MetricCard({ label, value, helper, icon = 'Activity', tone = 'blue' }) {
  const Icon = Icons[icon] || Icons.Activity
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
  }

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
          {helper && <p className="mt-1 text-xs text-ink-muted">{helper}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${toneClasses[tone] || toneClasses.blue}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${className}`}>
      {children}
    </span>
  )
}

export function FilterBar({ children, search, onSearchChange, searchPlaceholder = 'Search', loading, onRefresh }) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-card">
      <div className="grid gap-3 xl:grid-cols-[minmax(240px,1.2fr)_repeat(4,minmax(150px,1fr))_auto]">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-surface-200 bg-white py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        {children}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink-muted transition hover:bg-surface-100 hover:text-ink disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Icons.RefreshCw size={15} />}
            Refresh
          </button>
        )}
      </div>
    </div>
  )
}

export function SelectControl({ value, onChange, children, label }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-semibold text-ink-muted">{label}</span>}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  )
}

export function TextControl({ value, onChange, label, type = 'text', placeholder, required, min, rows }) {
  const baseClass = 'w-full rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-semibold text-ink-muted">{label}{required ? ' *' : ''}</span>}
      {rows ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          min={min}
          className={baseClass}
        />
      )}
    </label>
  )
}

export function ModalShell({ open, title, description, icon = 'PanelTopOpen', saving, onClose, children, footer }) {
  if (!open) return null

  const Icon = Icons[icon] || Icons.PanelTopOpen

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-6"
      onClick={() => !saving && onClose?.()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl border border-surface-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-surface-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
              <Icon size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">{title}</h3>
              {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-ink-muted transition hover:bg-surface-100 hover:text-ink disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[calc(92vh-148px)] overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer && <div className="border-t border-surface-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function FormActions({ saving, submitLabel, onCancel, formId }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-50 disabled:opacity-60"
      >
        Cancel
      </button>
      <button
        type="submit"
        form={formId}
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
      >
        {saving && <Loader2 size={15} className="animate-spin" />}
        {saving ? 'Saving...' : submitLabel}
      </button>
    </div>
  )
}

export function ConfirmModal({ open, title, description, confirmLabel = 'Delete', loading, onCancel, onConfirm }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-xl border border-surface-200 bg-white shadow-2xl">
        <div className="px-5 pt-5">
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-ink-muted">{description}</p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ title, description, icon = 'Inbox' }) {
  const Icon = Icons[icon] || Icons.Inbox
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-surface-200 bg-surface-100 text-ink-muted">
        <Icon size={22} />
      </div>
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p>}
    </div>
  )
}

export function TableShell({ title, subtitle, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-card">
      {(title || subtitle) && (
        <div className="border-b border-surface-100 bg-surface-100/50 px-5 py-3.5">
          {title && <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{title}</p>}
          {subtitle && <p className="mt-0.5 text-[11px] text-ink-muted">{subtitle}</p>}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

export function PaginationBar({ page, limit, total, totalPages, onPageChange, onLimitChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-ink-muted">
        {total > 0 ? `Showing ${Math.max(1, (page - 1) * limit + 1)} - ${Math.min(page * limit, total)} of ${total}` : 'No records to display'}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm text-ink-muted"
        >
          {[10, 20, 50, 100].map((option) => (
            <option key={option} value={option}>{option} / page</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm text-ink-muted transition hover:bg-surface-50 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-2 text-sm text-ink-muted">{page} / {totalPages || 1}</span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= (totalPages || 1)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm text-ink-muted transition hover:bg-surface-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
