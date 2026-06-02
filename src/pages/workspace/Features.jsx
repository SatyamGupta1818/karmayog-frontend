import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit3, Loader2, MessageSquare, Trash2 } from 'lucide-react'
import { toast } from '../../components/common/Toast'
import projectsService from '../../apis/services/projects/projects.service'
import userService from '../../apis/services/users/user.service'
import featuresService from '../../apis/services/workspace/features.service'
import FeatureFormModal from './components/FeatureFormModal'
import CommentsPanel from './components/CommentsPanel'
import PermissionGuard from '../../components/common/PermissionGuard'
import {
  Badge,
  ConfirmModal,
  EmptyState,
  FilterBar,
  MetricCard,
  ModalShell,
  PaginationBar,
  SelectControl,
  TableShell,
  WorkspacePageHeader,
} from './components/WorkspacePrimitives'
import {
  extractList,
  extractPagination,
  FEATURE_STATUS_OPTIONS,
  formatDate,
  formatMinutes,
  getErrorMessage,
  getStoredOrgId,
  normalizeFeature,
  normalizeProject,
  normalizeUser,
  priorityTone,
  PRIORITY_OPTIONS,
  statusTone,
  withOrgId,
} from './workspaceUtils'

const DEFAULT_EDITOR = { open: false, mode: 'create', feature: null }

export default function Features() {
  const [features, setFeatures] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [projectId, setProjectId] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [commentsTarget, setCommentsTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [editor, setEditor] = useState(DEFAULT_EDITOR)
  const navigate = useNavigate()

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        orgId: getStoredOrgId() || undefined,
      }
      if (search.trim()) params.search = search.trim()
      if (projectId) params.projectId = projectId
      if (status) params.status = status
      if (priority) params.priority = priority

      const response = await featuresService.list(params)
      const items = extractList(response, 'features')
        .map(normalizeFeature)
        .filter((feature) => feature?.id)
      setFeatures(items)
      setPagination(extractPagination(response, limit, items.length))
    } catch (error) {
      toast.error('Failed to load features', getErrorMessage(error, 'Failed to load features.'))
      setFeatures([])
      setPagination({ page, limit, total: 0, totalPages: 1 })
    } finally {
      setLoading(false)
    }
  }, [limit, page, priority, projectId, search, status])

  const fetchReferences = useCallback(async () => {
    try {
      const [projectResponse, userResponse] = await Promise.all([
        projectsService.list({ page: 1, limit: 200, orgId: getStoredOrgId() || undefined }),
        userService.list({ page: 1, limit: 200 }),
      ])
      setProjects(extractList(projectResponse, 'projects').map(normalizeProject).filter((project) => project?.id))
      setUsers(extractList(userResponse, 'users').map(normalizeUser).filter((user) => user?.id))
    } catch (error) {
      toast.error('Failed to load reference data', getErrorMessage(error, 'Failed to load projects or users.'))
    }
  }, [])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  useEffect(() => {
    fetchReferences()
  }, [fetchReferences])

  const summary = useMemo(() => {
    const totalBudget = features.reduce((sum, feature) => sum + Number(feature.budgetMinutes || 0), 0)
    return {
      active: features.filter((feature) => feature.status === 'IN_PROGRESS').length,
      completed: features.filter((feature) => feature.status === 'COMPLETED').length,
      totalBudget,
    }
  }, [features])

  const handleSave = async (payload) => {
    try {
      setSaving(true)
      if (editor.mode === 'create') {
        await featuresService.create(withOrgId(payload))
        toast.success('Feature Created', `"${payload.name}" has been created.`)
      } else {
        await featuresService.update(editor.feature.id, payload)
        toast.success('Feature Updated', `"${payload.name}" has been updated.`)
      }
      setEditor(DEFAULT_EDITOR)
      await fetchFeatures()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to save feature.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await featuresService.delete(deleteTarget.id)
      toast.success('Feature Deleted', `"${deleteTarget.name}" has been deleted.`)
      setDeleteTarget(null)
      await fetchFeatures()
    } catch (error) {
      toast.error('Delete Failed', getErrorMessage(error, 'Failed to delete feature.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <WorkspacePageHeader
        title="Features"
        description="Define project feature areas, ownership, priority, planned dates, and execution budgets."
        actionLabel="New Feature"
        actionIcon="Flag"
        onAction={() => setEditor({ open: true, mode: 'create', feature: null })}
        actionPermission="features.CREATE"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Visible Features" value={pagination.total || features.length} helper="After current filters" icon="Flag" tone="blue" />
        <MetricCard label="In Progress" value={summary.active} helper="Features currently moving" icon="Activity" tone="amber" />
        <MetricCard label="Budget" value={formatMinutes(summary.totalBudget)} helper="Visible feature budget" icon="Clock3" tone="emerald" />
      </div>

      <FilterBar
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1) }}
        searchPlaceholder="Search features..."
        loading={loading}
        onRefresh={fetchFeatures}
      >
        <SelectControl value={projectId} onChange={(value) => { setProjectId(value); setPage(1) }}>
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </SelectControl>
        <SelectControl value={status} onChange={(value) => { setStatus(value); setPage(1) }}>
          <option value="">All statuses</option>
          {FEATURE_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </SelectControl>
        <SelectControl value={priority} onChange={(value) => { setPriority(value); setPage(1) }}>
          <option value="">All priorities</option>
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </SelectControl>
      </FilterBar>

      <TableShell title="Feature Register" subtitle="Project-scoped feature records with owners, priority, and dates.">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="min-w-[240px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Feature</th>
              <th className="min-w-[180px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Project</th>
              <th className="w-40 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Status</th>
              <th className="w-36 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Priority</th>
              <th className="min-w-[160px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Owner</th>
              <th className="w-32 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Due</th>
              <th className="w-32 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Budget</th>
              <th className="w-28 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <Loader2 size={24} className="mx-auto mb-2 animate-spin text-blue-600" />
                  <p className="text-sm text-ink-muted">Loading features...</p>
                </td>
              </tr>
            ) : features.length === 0 ? (
              <tr>
                <td colSpan={8}><EmptyState title="No features found" description="Create a feature or adjust the filters." icon="Flag" /></td>
              </tr>
            ) : (
              features.map((feature) => (
                <tr
                  key={feature.id}
                  onClick={() => navigate(`/workspace/features/details?featureId=${feature.id}`)}
                  className="cursor-pointer border-b border-surface-100 last:border-0 hover:bg-surface-100/40"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{feature.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{feature.description || 'No description provided.'}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-muted">{feature.projectName || '-'}</td>
                  <td className="px-5 py-4"><Badge className={statusTone(feature.status)}>{feature.status}</Badge></td>
                  <td className="px-5 py-4"><Badge className={priorityTone(feature.priority)}>{feature.priority}</Badge></td>
                  <td className="px-5 py-4 text-ink-muted">{feature.ownerName || '-'}</td>
                  <td className="px-5 py-4 text-ink-muted">{formatDate(feature.dueDate)}</td>
                  <td className="px-5 py-4 text-ink-muted">{formatMinutes(feature.budgetMinutes)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setCommentsTarget(feature)
                        }}
                        className="rounded-lg p-2 text-ink-muted transition hover:bg-violet-50 hover:text-violet-600"
                        title="Comments"
                      >
                        <MessageSquare size={15} />
                      </button>
                      <PermissionGuard permission="features.UPDATE">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setEditor({ open: true, mode: 'edit', feature })
                          }}
                          className="rounded-lg p-2 text-ink-muted transition hover:bg-blue-50 hover:text-blue-600"
                          title="Edit feature"
                        >
                          <Edit3 size={15} />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="features.DELETE">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setDeleteTarget(feature)
                          }}
                          className="rounded-lg p-2 text-ink-muted transition hover:bg-red-50 hover:text-red-600"
                          title="Delete feature"
                        >
                          <Trash2 size={15} />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableShell>

      <PaginationBar
        page={page}
        limit={limit}
        total={pagination.total}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
        onLimitChange={(value) => { setLimit(value); setPage(1) }}
      />

      <FeatureFormModal
        open={editor.open}
        mode={editor.mode}
        feature={editor.feature}
        saving={saving}
        projects={projects}
        users={users}
        onClose={() => !saving && setEditor(DEFAULT_EDITOR)}
        onSubmit={handleSave}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete feature?"
        description={deleteTarget ? `This will delete "${deleteTarget.name}".` : ''}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <ModalShell
        open={!!commentsTarget}
        title={commentsTarget?.name || 'Feature comments'}
        description="Discuss scope, ownership, blockers, and delivery notes for this feature."
        icon="MessageSquare"
        onClose={() => setCommentsTarget(null)}
      >
        {commentsTarget && (
          <CommentsPanel targetType="FEATURE" targetId={commentsTarget.id} title="Feature Comments" />
        )}
      </ModalShell>
    </div>
  )
}
