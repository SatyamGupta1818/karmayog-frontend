import {
  ArrowRightLeft,
  Building2,
  Check,
  CreditCard,
  Globe2,
  Loader2,
  Mail,
  Pencil,
  Power,
  Trash2,
} from 'lucide-react'

const planClasses = {
  FREE: 'border-surface-200 bg-surface-100 text-ink-muted',
  PRO: 'border-blue-100 bg-blue-50 text-blue-700',
  PREMIUM: 'border-violet-100 bg-violet-50 text-violet-700',
}

function OrganizationInitials({ name }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'O'

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow-sm shadow-amber-500/20">
      {initials}
    </div>
  )
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
          : 'border-surface-200 bg-surface-100 text-ink-muted'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-surface-400'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function SubscriptionBadge({ taken }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        taken
          ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
          : 'border-surface-200 bg-surface-100 text-ink-muted'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${taken ? 'bg-emerald-500' : 'bg-surface-400'}`} />
      {taken ? 'Subscribed' : 'Not subscribed'}
    </span>
  )
}

export default function OrganizationTable({
  organizations,
  loading,
  updatingId,
  switchingId,
  currentOrganizationId,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleSubscription,
  onSwitch,
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-surface-100 bg-surface-100/50 px-5 py-3.5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Organizations ({organizations.length})
          </p>
          <p className="mt-0.5 text-[11px] text-ink-muted">Tenant records and subscription state.</p>
        </div>
        <Building2 size={17} className="text-ink-muted" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="min-w-[280px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Organization
              </th>
              <th className="min-w-[190px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Profile
              </th>
              <th className="min-w-[180px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Subscription
              </th>
              <th className="w-28 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Status
              </th>
              <th className="min-w-[145px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Updated
              </th>
              <th className="w-44 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Loader2 size={24} className="mx-auto mb-2 animate-spin text-amber-500" />
                  <p className="text-sm text-ink-muted">Loading organizations...</p>
                </td>
              </tr>
            ) : organizations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <Building2 size={26} className="mx-auto mb-3 text-ink-muted" />
                  <p className="text-sm font-medium text-ink">No organizations found</p>
                  <p className="mt-1 text-xs text-ink-muted">Create an organization or adjust the filters.</p>
                </td>
              </tr>
            ) : (
              organizations.map((organization) => {
                const isUpdating = updatingId === organization.id
                const isSwitching = switchingId === organization.id
                const isCurrent = organization.id === currentOrganizationId

                return (
                  <tr
                    key={organization.id}
                    className="border-b border-surface-100 transition-colors last:border-0 hover:bg-surface-100/30"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <OrganizationInitials name={organization.name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-semibold text-ink">{organization.name}</p>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                <Check size={11} />
                                Current
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                            {organization.email && (
                              <span className="inline-flex min-w-0 items-center gap-1.5">
                                <Mail size={12} />
                                <span className="truncate">{organization.email}</span>
                              </span>
                            )}
                            {organization.website && (
                              <span className="inline-flex min-w-0 items-center gap-1.5">
                                <Globe2 size={12} />
                                <span className="truncate">{organization.website}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold capitalize text-blue-700">
                          {organization.type.replace(/_/g, ' ')}
                        </span>
                        <span className="rounded-lg border border-surface-200 bg-surface-100 px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
                          {organization.size || 'No size'}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex w-fit items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${planClasses[organization.subscriptionType] || planClasses.FREE}`}>
                          <CreditCard size={12} />
                          {organization.subscriptionType}
                        </span>
                        <SubscriptionBadge taken={organization.isSubscriptionTaken} />
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge active={organization.isActive} />
                    </td>

                    <td className="px-5 py-3.5 text-xs text-ink-muted">
                      <div className="font-medium text-ink">{organization.updatedAtLabel}</div>
                      <div className="mt-0.5">{organization.createdAtLabel}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onSwitch(organization)}
                          disabled={!organization.isActive || isCurrent || switchingId !== null}
                          className="rounded-lg p-2 text-ink-muted transition-all hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title={isCurrent ? 'Current organization' : 'Switch context'}
                        >
                          {isSwitching ? <Loader2 size={14} className="animate-spin" /> : <ArrowRightLeft size={14} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleSubscription(organization)}
                          disabled={isUpdating}
                          className="rounded-lg p-2 text-ink-muted transition-all hover:bg-violet-50 hover:text-violet-600 disabled:opacity-50"
                          title={organization.isSubscriptionTaken ? 'Mark subscription inactive' : 'Mark subscription active'}
                        >
                          {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleStatus(organization)}
                          disabled={isUpdating}
                          className="rounded-lg p-2 text-ink-muted transition-all hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                          title={organization.isActive ? 'Mark inactive' : 'Mark active'}
                        >
                          {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(organization)}
                          className="rounded-lg p-2 text-ink-muted transition-all hover:bg-amber-50 hover:text-amber-600"
                          title="Edit organization"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(organization)}
                          disabled={isCurrent}
                          className="rounded-lg p-2 text-ink-muted transition-all hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title={isCurrent ? 'Current organization cannot be deleted here' : 'Delete organization'}
                        >
                          <Trash2 size={14} />
                        </button>
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
