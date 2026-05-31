import { Filter, RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PLANNING', label: 'Planning' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
]

export default function ProjectToolbar({
  search,
  status,
  loading,
  onSearchChange,
  onFilterChange,
  onRefresh,
  departments = [],
  departmentId = '',
  sortBy = 'createdAt',
  sortOrder = 'DESC',
}) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white px-4 py-4 shadow-card">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink shadow-sm transition-all placeholder:text-ink-muted focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            <Filter size={14} />
            Filters
          </div>

          <select
            value={status}
            onChange={(event) => onFilterChange('status', event.target.value)}
            className="rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-ink-muted outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={departmentId}
            onChange={(event) => onFilterChange('department', event.target.value)}
            className="rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-ink-muted outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => onFilterChange('sortBy', event.target.value)}
            className="rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-ink-muted outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="createdAt">Sort: Created At</option>
            <option value="name">Sort: Name</option>
            <option value="status">Sort: Status</option>
            <option value="department">Sort: Department</option>
          </select>

          <button
            type="button"
            onClick={() => onFilterChange('sortOrder', sortOrder === 'ASC' ? 'DESC' : 'ASC')}
            className="rounded-xl border px-3 py-2 text-xs font-semibold text-ink-muted"
            title="Toggle sort order"
          >
            {sortOrder === 'ASC' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-surface-200 bg-white text-ink-muted shadow-sm transition-all hover:text-ink disabled:opacity-50"
            title="Refresh projects"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </div>
  )
}
