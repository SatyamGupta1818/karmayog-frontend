import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Edit3, Loader2, MessageSquare, Trash2 } from 'lucide-react'
import { toast } from '../../components/common/Toast'
import projectsService from '../../apis/services/projects/projects.service'
import userService from '../../apis/services/users/user.service'
import featuresService from '../../apis/services/workspace/features.service'
import issuesService from '../../apis/services/workspace/issues.service'
import subtasksService from '../../apis/services/workspace/subtasks.service'
import tasksService from '../../apis/services/workspace/tasks.service'
import CommentsPanel from './components/CommentsPanel'
import IssueFormModal from './components/IssueFormModal'
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
  formatDate,
  formatMinutes,
  getErrorMessage,
  getStoredOrgId,
  ISSUE_PRIORITY_OPTIONS,
  ISSUE_STATUS_OPTIONS,
  ISSUE_TYPE_OPTIONS,
  normalizeFeature,
  normalizeIssue,
  normalizeProject,
  normalizeSubTask,
  normalizeTask,
  normalizeUser,
  priorityTone,
  SEVERITY_OPTIONS,
  statusTone,
  withOrgId,
} from './workspaceUtils'

const DEFAULT_EDITOR = { open: false, mode: 'create', issue: null }

export default function Issues() {
  const [issues, setIssues] = useState([])
  const [projects, setProjects] = useState([])
  const [features, setFeatures] = useState([])
  const [tasks, setTasks] = useState([])
  const [subtasks, setSubtasks] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [projectId, setProjectId] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [severity, setSeverity] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [resolvingId, setResolvingId] = useState('')
  const [editor, setEditor] = useState(DEFAULT_EDITOR)
  const [commentsTarget, setCommentsTarget] = useState(null)
  const navigate = useNavigate()

  const fetchIssues = useCallback(async () => {
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
      if (type) params.type = type
      if (status) params.status = status
      if (priority) params.priority = priority
      if (severity) params.severity = severity

      const response = await issuesService.list(params)
      const items = extractList(response, 'issues')
        .map(normalizeIssue)
        .filter((issue) => issue?.id)
      setIssues(items)
      setPagination(extractPagination(response, limit, items.length))
    } catch (error) {
      toast.error('Failed to load issues', getErrorMessage(error, 'Failed to load issues.'))
      setIssues([])
      setPagination({ page, limit, total: 0, totalPages: 1 })
    } finally {
      setLoading(false)
    }
  }, [limit, page, priority, projectId, search, severity, status, type])

  const fetchReferences = useCallback(async () => {
    try {
      const orgId = getStoredOrgId() || undefined
      const [projectResponse, featureResponse, taskResponse, subtaskResponse, userResponse] = await Promise.all([
        projectsService.list({ page: 1, limit: 200, orgId }),
        featuresService.list({ page: 1, limit: 300, orgId }),
        tasksService.list({ page: 1, limit: 500, orgId }),
        subtasksService.list({ page: 1, limit: 500, orgId }),
        userService.list({ page: 1, limit: 200 }),
      ])
      setProjects(extractList(projectResponse, 'projects').map(normalizeProject).filter((project) => project?.id))
      setFeatures(extractList(featureResponse, 'features').map(normalizeFeature).filter((feature) => feature?.id))
      setTasks(extractList(taskResponse, 'tasks').map(normalizeTask).filter((task) => task?.id))
      setSubtasks(extractList(subtaskResponse, 'subtasks').map(normalizeSubTask).filter((subtask) => subtask?.id))
      setUsers(extractList(userResponse, 'users').map(normalizeUser).filter((user) => user?.id))
    } catch (error) {
      toast.error('Failed to load reference data', getErrorMessage(error, 'Failed to load workspace references.'))
    }
  }, [])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  useEffect(() => {
    fetchReferences()
  }, [fetchReferences])

  const summary = useMemo(() => ({
    open: issues.filter((issue) => issue.status === 'OPEN' || issue.status === 'REOPENED').length,
    bugs: issues.filter((issue) => issue.type === 'BUG').length,
    budget: issues.reduce((sum, issue) => sum + Number(issue.budgetMinutes || 0), 0),
  }), [issues])

  const handleSave = async (payload) => {
    try {
      setSaving(true)
      if (editor.mode === 'create') {
        await issuesService.create(withOrgId(payload))
        toast.success('Issue Created', `"${payload.title}" has been created.`)
      } else {
        await issuesService.update(editor.issue.id, payload)
        toast.success('Issue Updated', `"${payload.title}" has been updated.`)
      }
      setEditor(DEFAULT_EDITOR)
      await fetchIssues()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to save issue.'))
    } finally {
      setSaving(false)
    }
  }

  const handleResolve = async (issue) => {
    try {
      setResolvingId(issue.id)
      await issuesService.update(issue.id, {
        status: 'RESOLVED',
        resolution: issue.resolution || 'Resolved from workspace issue board.',
      })
      toast.success('Issue Resolved', `"${issue.title}" has been marked resolved.`)
      await fetchIssues()
    } catch (error) {
      toast.error('Resolve Failed', getErrorMessage(error, 'Failed to resolve issue.'))
    } finally {
      setResolvingId('')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await issuesService.delete(deleteTarget.id)
      toast.success('Issue Deleted', `"${deleteTarget.title}" has been deleted.`)
      setDeleteTarget(null)
      await fetchIssues()
    } catch (error) {
      toast.error('Delete Failed', getErrorMessage(error, 'Failed to delete issue.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <WorkspacePageHeader
        title="Issues"
        description="Track issues and bugs across project, feature, task, and subtask hierarchy."
        actionLabel="New Issue"
        actionIcon="Bug"
        onAction={() => setEditor({ open: true, mode: 'create', issue: null })}
        actionPermission="issues.CREATE"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Open / Reopened" value={summary.open} helper="Needs team attention" icon="AlertCircle" tone="red" />
        <MetricCard label="Bugs" value={summary.bugs} helper="Visible bug records" icon="Bug" tone="amber" />
        <MetricCard label="Issue Budget" value={formatMinutes(summary.budget)} helper="Visible issue budget" icon="Clock3" tone="emerald" />
      </div>

      <FilterBar
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1) }}
        searchPlaceholder="Search issues and bugs..."
        loading={loading}
        onRefresh={fetchIssues}
      >
        <SelectControl value={projectId} onChange={(value) => { setProjectId(value); setPage(1) }}>
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </SelectControl>
        <SelectControl value={type} onChange={(value) => { setType(value); setPage(1) }}>
          <option value="">All types</option>
          {ISSUE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </SelectControl>
        <SelectControl value={status} onChange={(value) => { setStatus(value); setPage(1) }}>
          <option value="">All statuses</option>
          {ISSUE_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </SelectControl>
        <SelectControl value={priority} onChange={(value) => { setPriority(value); setPage(1) }}>
          <option value="">All priorities</option>
          {ISSUE_PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </SelectControl>
        <SelectControl value={severity} onChange={(value) => { setSeverity(value); setPage(1) }}>
          <option value="">All severities</option>
          {SEVERITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </SelectControl>
      </FilterBar>

      <TableShell title="Issue Register" subtitle="Validated issue and bug records linked to execution hierarchy.">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="min-w-[260px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Issue</th>
              <th className="min-w-[180px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Hierarchy</th>
              <th className="w-28 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Type</th>
              <th className="w-40 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Status</th>
              <th className="w-36 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Priority</th>
              <th className="w-36 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Severity</th>
              <th className="w-32 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Due</th>
              <th className="w-40 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <Loader2 size={24} className="mx-auto mb-2 animate-spin text-blue-600" />
                  <p className="text-sm text-ink-muted">Loading issues...</p>
                </td>
              </tr>
            ) : issues.length === 0 ? (
              <tr>
                <td colSpan={8}><EmptyState title="No issues found" description="Create an issue or adjust the filters." icon="Bug" /></td>
              </tr>
            ) : (
              issues.map((issue) => (
                <tr
                  key={issue.id}
                  onClick={() => navigate(`/workspace/issues/details?issueId=${issue.id}`)}
                  className="cursor-pointer border-b border-surface-100 last:border-0 hover:bg-surface-100/40"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{issue.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{issue.description || 'No description provided.'}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-ink-muted">
                    <p className="font-semibold text-ink-muted">{issue.projectName || '-'}</p>
                    <p>{issue.featureName || 'No feature'}</p>
                    <p>{issue.taskTitle || 'No task'}</p>
                  </td>
                  <td className="px-5 py-4"><Badge className={issue.type === 'BUG' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}>{issue.type}</Badge></td>
                  <td className="px-5 py-4"><Badge className={statusTone(issue.status)}>{issue.status}</Badge></td>
                  <td className="px-5 py-4"><Badge className={priorityTone(issue.priority)}>{issue.priority}</Badge></td>
                  <td className="px-5 py-4"><Badge className={priorityTone(issue.severity)}>{issue.severity}</Badge></td>
                  <td className="px-5 py-4 text-ink-muted">{formatDate(issue.dueDate)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setCommentsTarget(issue)
                        }}
                        className="rounded-lg p-2 text-ink-muted transition hover:bg-violet-50 hover:text-violet-600"
                        title="Comments"
                      >
                        <MessageSquare size={15} />
                      </button>
                      <PermissionGuard permission="issues.UPDATE">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleResolve(issue)
                          }}
                          disabled={issue.status === 'RESOLVED' || issue.status === 'CLOSED' || resolvingId === issue.id}
                          className="rounded-lg p-2 text-ink-muted transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-40"
                          title="Resolve issue"
                        >
                          {resolvingId === issue.id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setEditor({ open: true, mode: 'edit', issue })
                          }}
                          className="rounded-lg p-2 text-ink-muted transition hover:bg-blue-50 hover:text-blue-600"
                          title="Edit issue"
                        >
                          <Edit3 size={15} />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="issues.DELETE">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setDeleteTarget(issue)
                          }}
                          className="rounded-lg p-2 text-ink-muted transition hover:bg-red-50 hover:text-red-600"
                          title="Delete issue"
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

      <IssueFormModal
        open={editor.open}
        mode={editor.mode}
        issue={editor.issue}
        saving={saving}
        projects={projects}
        features={features}
        tasks={tasks}
        subtasks={subtasks}
        users={users}
        onClose={() => !saving && setEditor(DEFAULT_EDITOR)}
        onSubmit={handleSave}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete issue?"
        description={deleteTarget ? `This will delete "${deleteTarget.title}".` : ''}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <ModalShell
        open={!!commentsTarget}
        title={commentsTarget?.title || 'Issue comments'}
        description="Keep reproduction notes, fix context, and review comments together."
        icon="MessageSquare"
        onClose={() => setCommentsTarget(null)}
      >
        {commentsTarget && (
          <CommentsPanel targetType="ISSUE" targetId={commentsTarget.id} title="Issue Comments" />
        )}
      </ModalShell>
    </div>
  )
}
