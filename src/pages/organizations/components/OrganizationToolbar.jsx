import { Filter, RefreshCw, Search } from 'lucide-react'

export default function OrganizationToolbar({
  search,
  filters,
  loading,
  onSearchChange,
  onFilterChange,
  onRefresh,
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
            placeholder="Search organizations..."
            className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink shadow-sm transition-all placeholder:text-ink-muted focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            <Filter size={14} />
            Filters
          </div>

          <select
            value={filters.subscriptionType}
            onChange={(event) => onFilterChange('subscriptionType', event.target.value)}
            className="rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-ink-muted outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">All Plans</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
            <option value="PREMIUM">Premium</option>
          </select>

          <select
            value={filters.isSubscriptionTaken}
            onChange={(event) => onFilterChange('isSubscriptionTaken', event.target.value)}
            className="rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-ink-muted outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">All Subscriptions</option>
            <option value="true">Subscribed</option>
            <option value="false">Not Subscribed</option>
          </select>

          <select
            value={filters.isActive}
            onChange={(event) => onFilterChange('isActive', event.target.value)}
            className="rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-ink-muted outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-surface-200 bg-white text-ink-muted shadow-sm transition-all hover:text-ink disabled:opacity-50"
            title="Refresh organizations"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </div>
  )
}
