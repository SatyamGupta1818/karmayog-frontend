import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import organizationService from '../../apis/services/organization/organization.service'
import { toast } from '../../components/common/Toast'
import { clearRbac, fetchPermissions } from '../../store/slices/rbacSlice'
import { selectCurrentUser, setCredentials } from '../../store/slices/authSlice'
import { getOrganizationDetails } from '../../utils/session'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import OrganizationFormModal from './components/OrganizationFormModal'
import OrganizationSummary from './components/OrganizationSummary'
import OrganizationTable from './components/OrganizationTable'
import OrganizationToolbar from './components/OrganizationToolbar'

const DEFAULT_FILTERS = {
  subscriptionType: '',
  isSubscriptionTaken: '',
  isActive: '',
}

const DEFAULT_EDITOR = {
  open: false,
  mode: 'create',
  item: null,
}

const getEntityId = (entity) => {
  if (!entity) return ''
  const keys = ['id', 'organizationId', 'orgId', '_id', 'uuid']
  const value = keys.map((key) => entity[key]).find((candidate) => candidate !== undefined && candidate !== null)
  return value !== undefined && value !== null ? String(value) : ''
}

const normalizeBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() !== 'false'
  if (value === 1 || value === '1') return true
  if (value === 0 || value === '0') return false
  return fallback
}

const extractList = (response, resourceKey) => {
  if (Array.isArray(response)) return response

  const candidates = [
    response?.[resourceKey],
    response?.items,
    response?.results,
    response?.rows,
    response?.data,
    response?.data?.[resourceKey],
    response?.data?.items,
    response?.data?.results,
    response?.data?.rows,
    response?.data?.data,
  ]

  return candidates.find(Array.isArray) || []
}

const extractEntity = (response, resourceKey) => {
  const candidates = [
    response?.[resourceKey],
    response?.data?.[resourceKey],
    response?.data?.data,
    response?.data,
    response,
  ]

  return candidates.find((candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate)) || null
}

const getErrorMessage = (error, fallback) => {
  const message = error?.response?.data?.message || error?.response?.data?.error || error?.message
  return Array.isArray(message) ? message.join(', ') : message || fallback
}

const toBooleanFilter = (value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

const formatDate = (value) => {
  if (!value) return 'Not set'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not set'

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const normalizeOrganization = (organization) => {
  const name = organization?.organizationName
    || organization?.name
    || organization?.orgName
    || organization?.companyName
    || 'Untitled Organization'

  return {
    id: getEntityId(organization),
    name,
    type: organization?.organizationType || organization?.type || 'other',
    size: organization?.organizationSize || organization?.size || '',
    email: organization?.orgEmail || organization?.email || '',
    website: organization?.website || '',
    subscriptionType: organization?.subscriptionType || 'FREE',
    isSubscriptionTaken: normalizeBoolean(organization?.isSubscriptionTaken, false),
    isActive: normalizeBoolean(organization?.isActive, true),
    owner: organization?.owner || null,
    createdAt: organization?.createdAt || organization?.created_at || '',
    updatedAt: organization?.updatedAt || organization?.updated_at || organization?.createdAt || '',
    createdAtLabel: formatDate(organization?.createdAt || organization?.created_at),
    updatedAtLabel: formatDate(organization?.updatedAt || organization?.updated_at || organization?.createdAt),
    raw: organization,
  }
}

export default function Organizations() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const [organizations, setOrganizations] = useState([])
  const [currentOrganization, setCurrentOrganization] = useState(() => getOrganizationDetails(user))
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [switchingId, setSwitchingId] = useState(null)
  const [editor, setEditor] = useState(DEFAULT_EDITOR)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      }

      if (search.trim()) params.search = search.trim()
      if (filters.subscriptionType) params.subscriptionType = filters.subscriptionType

      const isSubscriptionTaken = toBooleanFilter(filters.isSubscriptionTaken)
      if (typeof isSubscriptionTaken === 'boolean') params.isSubscriptionTaken = isSubscriptionTaken

      const isActive = toBooleanFilter(filters.isActive)
      if (typeof isActive === 'boolean') params.isActive = isActive

      const response = await organizationService.list(params)
      const normalized = extractList(response, 'organizations')
        .map(normalizeOrganization)
        .filter((organization) => organization.id)

      setOrganizations(normalized)
    } catch (error) {
      toast.error('Failed to load organizations', getErrorMessage(error, 'Failed to load organizations.'))
      setOrganizations([])
    } finally {
      setLoading(false)
    }
  }, [filters, search])

  useEffect(() => {
    fetchOrganizations()
  }, [fetchOrganizations])

  useEffect(() => {
    setCurrentOrganization(getOrganizationDetails(user))
  }, [user])

  useEffect(() => {
    const handleOrganizationSwitch = (event) => {
      const nextOrganization = normalizeOrganization(event.detail)
      if (nextOrganization?.id) {
        setCurrentOrganization(nextOrganization)
      }
    }

    window.addEventListener('organization:switch', handleOrganizationSwitch)
    return () => window.removeEventListener('organization:switch', handleOrganizationSwitch)
  }, [])

  const summary = useMemo(() => ({
    organizationCount: organizations.length,
    activeCount: organizations.filter((organization) => organization.isActive).length,
    subscribedCount: organizations.filter((organization) => organization.isSubscriptionTaken).length,
    premiumCount: organizations.filter((organization) => organization.subscriptionType === 'PREMIUM').length,
  }), [organizations])

  const handleFilterChange = (field, value) => {
    setFilters((previous) => ({ ...previous, [field]: value }))
  }

  const refreshOrganizations = async () => {
    await fetchOrganizations()
  }

  const openCreate = () => {
    setEditor({ open: true, mode: 'create', item: null })
  }

  const openEdit = async (organization) => {
    try {
      setUpdatingId(organization.id)
      const response = await organizationService.getById(organization.id)
      const fullOrganization = normalizeOrganization(extractEntity(response, 'organization') || organization.raw || organization)
      setEditor({ open: true, mode: 'edit', item: fullOrganization })
    } catch (error) {
      toast.error('Failed to load organization', getErrorMessage(error, 'Failed to load organization details.'))
    } finally {
      setUpdatingId(null)
    }
  }

  const closeEditor = () => {
    if (!saving) setEditor(DEFAULT_EDITOR)
  }

  const handleSave = async (payload) => {
    setSaving(true)

    try {
      if (editor.mode === 'create') {
        await organizationService.create(payload)
        toast.success('Organization Created', `"${payload.organizationName}" has been created.`)
      } else {
        await organizationService.update(editor.item.id, payload)
        toast.success('Organization Updated', `"${payload.organizationName}" has been updated.`)
      }

      setEditor(DEFAULT_EDITOR)
      await fetchOrganizations()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to save organization.'))
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (organization) => {
    setUpdatingId(organization.id)

    try {
      await organizationService.update(organization.id, { isActive: !organization.isActive })
      toast.success(
        organization.isActive ? 'Organization Deactivated' : 'Organization Activated',
        `"${organization.name}" is now ${organization.isActive ? 'inactive' : 'active'}.`
      )
      await fetchOrganizations()
    } catch (error) {
      toast.error('Status Update Failed', getErrorMessage(error, 'Failed to update organization status.'))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleSubscription = async (organization) => {
    setUpdatingId(organization.id)

    try {
      await organizationService.update(organization.id, {
        isSubscriptionTaken: !organization.isSubscriptionTaken,
      })
      toast.success(
        organization.isSubscriptionTaken ? 'Subscription Marked Inactive' : 'Subscription Marked Active',
        `"${organization.name}" subscription state has been updated.`
      )
      await fetchOrganizations()
    } catch (error) {
      toast.error('Subscription Update Failed', getErrorMessage(error, 'Failed to update subscription state.'))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSwitchOrganization = async (organization) => {
    if (!organization?.id || organization.id === currentOrganization?.id) return

    setSwitchingId(organization.id)

    try {
      const response = await organizationService.switchOrganization(organization.id)
      const payload = response?.data || response || {}

      dispatch(setCredentials({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: payload.user,
      }))

      const nextOrganization = normalizeOrganization(payload.organization || organization.raw || organization)
      localStorage.setItem('organization', JSON.stringify(nextOrganization.raw || organization.raw || organization))
      setCurrentOrganization(nextOrganization)
      window.dispatchEvent(new CustomEvent('organization:switch', {
        detail: nextOrganization.raw || organization.raw || organization,
      }))

      dispatch(clearRbac())
      dispatch(fetchPermissions())

      toast.success('Organization Switched', `Now working in "${organization.name}".`)
    } catch (error) {
      toast.error('Switch Failed', getErrorMessage(error, 'Failed to switch organization.'))
    } finally {
      setSwitchingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeleting(true)

    try {
      await organizationService.delete(deleteTarget.id)
      toast.success('Organization Deleted', `"${deleteTarget.name}" has been deleted.`)
      setDeleteTarget(null)
      await fetchOrganizations()
    } catch (error) {
      toast.error('Delete Failed', getErrorMessage(error, 'Failed to delete organization.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Organizations</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Super Admin tenant control for KARMAYOG workspaces.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98]"
        >
          <Plus size={16} />
          Add Organization
        </button>
      </div>

      <OrganizationSummary {...summary} />

      <OrganizationToolbar
        search={search}
        filters={filters}
        loading={loading}
        onSearchChange={setSearch}
        onFilterChange={handleFilterChange}
        onRefresh={refreshOrganizations}
      />

      <OrganizationTable
        organizations={organizations}
        loading={loading}
        updatingId={updatingId}
        switchingId={switchingId}
        currentOrganizationId={currentOrganization?.id}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onToggleStatus={handleToggleStatus}
        onToggleSubscription={handleToggleSubscription}
        onSwitch={handleSwitchOrganization}
      />

      <OrganizationFormModal
        open={editor.open}
        mode={editor.mode}
        organization={editor.item}
        saving={saving}
        onClose={closeEditor}
        onSubmit={handleSave}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        organization={deleteTarget}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
