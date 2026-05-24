import { useEffect, useState } from 'react'
import { Building2, Loader2, X } from 'lucide-react'
import { toast } from '../../../components/common/Toast'

const EMPTY_FORM = {
  organizationName: '',
  organizationType: 'startup',
  organizationSize: '11-50',
  orgEmail: '',
  website: '',
  subscriptionType: 'FREE',
  isSubscriptionTaken: false,
  isActive: true,
}

const ORGANIZATION_TYPES = [
  { value: 'startup', label: 'Startup' },
  { value: 'sme', label: 'SME' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'non_profit', label: 'Non Profit' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
]

const ORGANIZATION_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+']
const SUBSCRIPTION_TYPES = ['FREE', 'PRO', 'PREMIUM']

function isValidEmail(value) {
  if (!value) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function OrganizationFormModal({
  open,
  mode,
  organization,
  saving,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return

    setForm({
      organizationName: organization?.name || '',
      organizationType: organization?.type || 'startup',
      organizationSize: organization?.size || '11-50',
      orgEmail: organization?.email || '',
      website: organization?.website || '',
      subscriptionType: organization?.subscriptionType || 'FREE',
      isSubscriptionTaken: organization?.isSubscriptionTaken ?? false,
      isActive: organization?.isActive ?? true,
    })
  }, [open, organization])

  if (!open) return null

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.organizationName.trim()) {
      toast.warning('Validation Error', 'Organization name is required.')
      return
    }

    if (!form.organizationType) {
      toast.warning('Validation Error', 'Organization type is required.')
      return
    }

    if (!form.organizationSize) {
      toast.warning('Validation Error', 'Organization size is required.')
      return
    }

    if (!isValidEmail(form.orgEmail.trim())) {
      toast.warning('Validation Error', 'Enter a valid organization email.')
      return
    }

    onSubmit({
      organizationName: form.organizationName.trim(),
      organizationType: form.organizationType,
      organizationSize: form.organizationSize,
      orgEmail: form.orgEmail.trim() || undefined,
      website: form.website.trim() || undefined,
      subscriptionType: form.subscriptionType,
      isSubscriptionTaken: form.isSubscriptionTaken,
      isActive: form.isActive,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-6"
      onClick={() => !saving && onClose()}
    >
      <div
        className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-surface-100 px-6 pb-4 pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
              <Building2 size={19} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">
                {mode === 'create' ? 'Create Organization' : 'Edit Organization'}
              </h3>
              <p className="mt-0.5 text-xs text-ink-muted">
                Tenant identity, subscription, and availability.
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

        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-9rem)] space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
                Organization Name *
              </label>
              <input
                type="text"
                value={form.organizationName}
                onChange={(event) => handleChange('organizationName', event.target.value)}
                placeholder="e.g. StackTech"
                className="w-full rounded-xl border border-surface-200 px-3 py-2.5 text-sm text-ink transition-all placeholder:text-ink-muted focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
                Type *
              </label>
              <select
                value={form.organizationType}
                onChange={(event) => handleChange('organizationType', event.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
              >
                {ORGANIZATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
                Size *
              </label>
              <select
                value={form.organizationSize}
                onChange={(event) => handleChange('organizationSize', event.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
              >
                {ORGANIZATION_SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
                Organization Email
              </label>
              <input
                type="email"
                value={form.orgEmail}
                onChange={(event) => handleChange('orgEmail', event.target.value)}
                placeholder="contact@company.com"
                className="w-full rounded-xl border border-surface-200 px-3 py-2.5 text-sm text-ink transition-all placeholder:text-ink-muted focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
                Website
              </label>
              <input
                type="text"
                value={form.website}
                onChange={(event) => handleChange('website', event.target.value)}
                placeholder="stacktech.com"
                className="w-full rounded-xl border border-surface-200 px-3 py-2.5 text-sm text-ink transition-all placeholder:text-ink-muted focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
                Plan
              </label>
              <select
                value={form.subscriptionType}
                onChange={(event) => handleChange('subscriptionType', event.target.value)}
                className="w-full rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20"
              >
                {SUBSCRIPTION_TYPES.map((plan) => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex items-center justify-between gap-3 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3">
                <span className="text-sm font-semibold text-ink">Subscribed</span>
                <input
                  type="checkbox"
                  checked={form.isSubscriptionTaken}
                  onChange={(event) => handleChange('isSubscriptionTaken', event.target.checked)}
                  className="h-4 w-4 rounded border-surface-300 text-amber-500 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3">
                <span className="text-sm font-semibold text-ink">Active</span>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => handleChange('isActive', event.target.checked)}
                  className="h-4 w-4 rounded border-surface-300 text-amber-500 focus:ring-amber-500"
                />
              </label>
            </div>
          </div>

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
              {mode === 'create' ? 'Create Organization' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
