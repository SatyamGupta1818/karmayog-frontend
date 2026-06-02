import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit3, Loader2, MessageSquare, Trash2 } from 'lucide-react'
import { toast } from '../../components/common/Toast'
import userService from '../../apis/services/users/user.service'
import featuresService from '../../apis/services/workspace/features.service'
import tasksService from '../../apis/services/workspace/tasks.service'
import CommentsPanel from './components/CommentsPanel'
import TaskFormModal from './components/TaskFormModal'
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
  normalizeFeature,
  normalizeTask,
  normalizeUser,
  priorityTone,
  PRIORITY_OPTIONS,
  statusTone,
  TASK_STATUS_OPTIONS,
  withOrgId,
} from './workspaceUtils'

const DEFAULT_EDITOR = { open: false, mode: 'create', task: null }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [features, setFeatures] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [featureId, setFeatureId] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [assignedToId, setAssignedToId] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [editor, setEditor] = useState(DEFAULT_EDITOR)
  const [commentsTarget, setCommentsTarget] = useState(null)
  const navigate = useNavigate()

  const fetchTasks = useCallback(async () => {
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
      if (featureId) params.featureId = featureId
      if (status) params.status = status
      if (priority) params.priority = priority
      if (assignedToId) params.assignedToId = assignedToId

      const response = await tasksService.list(params)
      const items = extractList(response, 'tasks')
        .map(normalizeTask)
        .filter((task) => task?.id)
      setTasks(items)
      setPagination(extractPagination(response, limit, items.length))
    } catch (error) {
      toast.error('Failed to load tasks', getErrorMessage(error, 'Failed to load tasks.'))
      setTasks([])
      setPagination({ page, limit, total: 0, totalPages: 1 })
    } finally {
      setLoading(false)
    }
  }, [assignedToId, featureId, limit, page, priority, search, status])

  const fetchReferences = useCallback(async () => {
    try {
      const [featuresResponse, usersResponse] = await Promise.all([
        featuresService.list({ page: 1, limit: 300, orgId: getStoredOrgId() || undefined }),
        userService.list({ page: 1, limit: 200 }),
      ])
      setFeatures(extractList(featuresResponse, 'features').map(normalizeFeature).filter((feature) => feature?.id))
      setUsers(extractList(usersResponse, 'users').map(normalizeUser).filter((user) => user?.id))
    } catch (error) {
      toast.error('Failed to load reference data', getErrorMessage(error, 'Failed to load features or users.'))
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    fetchReferences()
  }, [fetchReferences])

  const summary = useMemo(() => ({
    inProgress: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
    review: tasks.filter((task) => task.status === 'IN_REVIEW').length,
    budget: tasks.reduce((sum, task) => sum + Number(task.budgetMinutes || 0), 0),
  }), [tasks])

  const handleSave = async (payload) => {
    try {
      setSaving(true)
      if (editor.mode === 'create') {
        await tasksService.create(withOrgId(payload))
        toast.success('Task Created', `"${payload.title}" has been created.`)
      } else {
        await tasksService.update(editor.task.id, payload)
        toast.success('Task Updated', `"${payload.title}" has been updated.`)
      }
      setEditor(DEFAULT_EDITOR)
      await fetchTasks()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to save task.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await tasksService.delete(deleteTarget.id)
      toast.success('Task Deleted', `"${deleteTarget.title}" has been deleted.`)
      setDeleteTarget(null)
      await fetchTasks()
    } catch (error) {
      toast.error('Delete Failed', getErrorMessage(error, 'Failed to delete task.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <WorkspacePageHeader
        title="Tasks"
        description="Manage assignable execution work linked to features, owners, dates, statuses, and budgets."
        actionLabel="New Task"
        actionIcon="CheckSquare"
        onAction={() => setEditor({ open: true, mode: 'create', task: null })}
        actionPermission="tasks.CREATE"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Visible Tasks" value={pagination.total || tasks.length} helper="After current filters" icon="CheckSquare" tone="blue" />
        <MetricCard label="In Progress" value={summary.inProgress} helper="Tasks being executed" icon="Activity" tone="amber" />
        <MetricCard label="Task Budget" value={formatMinutes(summary.budget)} helper="Visible task budget" icon="Clock3" tone="emerald" />
      </div>

      <FilterBar
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1) }}
        searchPlaceholder="Search tasks..."
        loading={loading}
        onRefresh={fetchTasks}
      >
        <SelectControl value={featureId} onChange={(value) => { setFeatureId(value); setPage(1) }}>
          <option value="">All features</option>
          {features.map((feature) => (
            <option key={feature.id} value={feature.id}>{feature.name}</option>
          ))}
        </SelectControl>
        <SelectControl value={status} onChange={(value) => { setStatus(value); setPage(1) }}>
          <option value="">All statuses</option>
          {TASK_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </SelectControl>
        <SelectControl value={priority} onChange={(value) => { setPriority(value); setPage(1) }}>
          <option value="">All priorities</option>
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </SelectControl>
        <SelectControl value={assignedToId} onChange={(value) => { setAssignedToId(value); setPage(1) }}>
          <option value="">All assignees</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </SelectControl>
      </FilterBar>

      <TableShell title="Task Register" subtitle="Execution-ready tasks with hierarchy, assignment, status, dates, and budget.">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="min-w-[260px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Task</th>
              <th className="min-w-[180px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Feature</th>
              <th className="w-40 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Status</th>
              <th className="w-36 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Priority</th>
              <th className="min-w-[160px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Assignee</th>
              <th className="w-32 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Due</th>
              <th className="w-32 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Budget</th>
              <th className="w-36 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <Loader2 size={24} className="mx-auto mb-2 animate-spin text-blue-600" />
                  <p className="text-sm text-ink-muted">Loading tasks...</p>
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={8}><EmptyState title="No tasks found" description="Create a task or adjust the filters." icon="CheckSquare" /></td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => navigate(`/workspace/tasks/details?taskId=${task.id}`)}
                  className="cursor-pointer border-b border-surface-100 last:border-0 hover:bg-surface-100/40"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{task.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{task.description || 'No description provided.'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink-muted">{task.featureName || '-'}</p>
                    {task.projectName && <p className="mt-1 text-xs text-ink-muted">{task.projectName}</p>}
                  </td>
                  <td className="px-5 py-4"><Badge className={statusTone(task.status)}>{task.status}</Badge></td>
                  <td className="px-5 py-4"><Badge className={priorityTone(task.priority)}>{task.priority}</Badge></td>
                  <td className="px-5 py-4 text-ink-muted">{task.assignedToName || '-'}</td>
                  <td className="px-5 py-4 text-ink-muted">{formatDate(task.dueDate)}</td>
                  <td className="px-5 py-4 text-ink-muted">{formatMinutes(task.budgetMinutes)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setCommentsTarget(task)
                        }}
                        className="rounded-lg p-2 text-ink-muted transition hover:bg-violet-50 hover:text-violet-600"
                        title="Comments"
                      >
                        <MessageSquare size={15} />
                      </button>
                      <PermissionGuard permission="tasks.UPDATE">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setEditor({ open: true, mode: 'edit', task })
                          }}
                          className="rounded-lg p-2 text-ink-muted transition hover:bg-blue-50 hover:text-blue-600"
                          title="Edit task"
                        >
                          <Edit3 size={15} />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="tasks.DELETE">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setDeleteTarget(task)
                          }}
                          className="rounded-lg p-2 text-ink-muted transition hover:bg-red-50 hover:text-red-600"
                          title="Delete task"
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

      <TaskFormModal
        open={editor.open}
        mode={editor.mode}
        task={editor.task}
        saving={saving}
        features={features}
        users={users}
        onClose={() => !saving && setEditor(DEFAULT_EDITOR)}
        onSubmit={handleSave}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete task?"
        description={deleteTarget ? `This will delete "${deleteTarget.title}".` : ''}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <ModalShell
        open={!!commentsTarget}
        title={commentsTarget?.title || 'Task comments'}
        description="Discuss context, blockers, and handoff notes."
        icon="MessageSquare"
        onClose={() => setCommentsTarget(null)}
      >
        {commentsTarget && (
          <CommentsPanel targetType="TASK" targetId={commentsTarget.id} title="Task Comments" />
        )}
      </ModalShell>
    </div>
  )
}
