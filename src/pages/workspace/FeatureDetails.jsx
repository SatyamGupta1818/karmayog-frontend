import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from '../../components/common/Toast'
import projectsService from '../../apis/services/projects/projects.service'
import userService from '../../apis/services/users/user.service'
import featuresService from '../../apis/services/workspace/features.service'
import CommentsPanel from './components/CommentsPanel'
import FeatureFormModal from './components/FeatureFormModal'
import { Badge, MetricCard } from './components/WorkspacePrimitives'
import PermissionGuard from '../../components/common/PermissionGuard'
import {
  extractEntity,
  extractList,
  formatDate,
  formatMinutes,
  getErrorMessage,
  getStoredOrgId,
  normalizeFeature,
  normalizeProject,
  normalizeUser,
  priorityTone,
  statusTone,
} from './workspaceUtils'

export default function FeatureDetails() {
  const location = useLocation()
  const navigate = useNavigate()
  const featureId = new URLSearchParams(location.search).get('featureId') || ''
  const [feature, setFeature] = useState(null)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchFeature = useCallback(async () => {
    if (!featureId) return
    try {
      setLoading(true)
      const response = await featuresService.getById(featureId)
      setFeature(normalizeFeature(extractEntity(response, 'feature')))
    } catch (error) {
      toast.error('Failed to load feature', getErrorMessage(error, 'Failed to load feature details.'))
    } finally {
      setLoading(false)
    }
  }, [featureId])

  const fetchReferences = useCallback(async () => {
    try {
      const [projectResponse, userResponse] = await Promise.all([
        projectsService.list({ page: 1, limit: 300, orgId: getStoredOrgId() || undefined }),
        userService.list({ page: 1, limit: 300 }),
      ])
      setProjects(extractList(projectResponse, 'projects').map(normalizeProject).filter((item) => item?.id))
      setUsers(extractList(userResponse, 'users').map(normalizeUser).filter((item) => item?.id))
    } catch (error) {
      toast.error('Failed to load reference data', getErrorMessage(error, 'Failed to load projects or users.'))
    }
  }, [])

  useEffect(() => {
    fetchFeature()
    fetchReferences()
  }, [fetchFeature, fetchReferences])

  const handleSave = async (payload) => {
    if (!feature?.id) return
    try {
      setSaving(true)
      await featuresService.update(feature.id, payload)
      toast.success('Feature Updated', `"${payload.name}" has been updated.`)
      setEditing(false)
      await fetchFeature()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to update feature.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-surface-200 bg-white p-8 shadow-card">
        <Loader2 size={24} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (!feature) {
    return (
      <div className="rounded-xl border border-surface-200 bg-white p-8 shadow-card">
        <p className="text-sm text-ink-muted">Feature could not be found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/workspace/features')}
            className="mb-3 inline-flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-100 hover:text-ink"
          >
            <ArrowLeft size={15} />
            Back to features
          </button>
          <h2 className="text-2xl font-semibold text-ink">{feature.name}</h2>
          <p className="mt-1 text-sm text-ink-muted">Feature details, long-form guidance, and team comments.</p>
        </div>
        <PermissionGuard permission="feature details.UPDATE">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Edit3 size={16} />
            Edit Feature
          </button>
        </PermissionGuard>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Status" value={feature.status} helper="Feature workflow" icon="Activity" tone="blue" />
        <MetricCard label="Priority" value={feature.priority} helper="Delivery priority" icon="Flame" tone="amber" />
        <MetricCard label="Budget" value={formatMinutes(feature.budgetMinutes)} helper="Planned effort" icon="Clock3" tone="emerald" />
        <MetricCard label="Due Date" value={formatDate(feature.dueDate)} helper="Target completion" icon="CalendarDays" tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-surface-200 bg-white p-6 shadow-card">
            <div className="flex flex-wrap gap-2">
              <Badge className={statusTone(feature.status)}>{feature.status}</Badge>
              <Badge className={priorityTone(feature.priority)}>{feature.priority}</Badge>
            </div>
            <h3 className="mt-5 text-sm font-semibold uppercase tracking-wider text-ink-muted">Full Description / Guidance</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">
              {feature.description || 'No description or guidance has been provided.'}
            </p>
          </section>

          <CommentsPanel targetType="FEATURE" targetId={feature.id} title="Feature Comments" />
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Hierarchy</p>
            <button
              type="button"
              onClick={() => feature.projectId && navigate(`/workspace/projects/details?projectId=${feature.projectId}`)}
              className="mt-3 flex w-full items-center justify-between gap-3 rounded-lg border border-surface-200 px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-surface-50"
            >
              <span className="truncate">{feature.projectName || feature.projectId || 'No project'}</span>
              <ExternalLink size={14} className="text-ink-muted" />
            </button>
          </div>

          <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Ownership</p>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-ink-muted">Owner</dt>
                <dd className="mt-1 font-semibold text-ink">{feature.ownerName || 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Start</dt>
                <dd className="mt-1 font-semibold text-ink">{formatDate(feature.startDate)}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Due</dt>
                <dd className="mt-1 font-semibold text-ink">{formatDate(feature.dueDate)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <FeatureFormModal
        open={editing}
        mode="edit"
        feature={feature}
        saving={saving}
        projects={projects}
        users={users}
        onClose={() => !saving && setEditing(false)}
        onSubmit={handleSave}
      />
    </div>
  )
}
