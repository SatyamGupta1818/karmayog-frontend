export default function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
          : 'border-surface-200 bg-surface-100 text-ink-muted'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? 'bg-emerald-500' : 'bg-surface-400'
        }`}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
