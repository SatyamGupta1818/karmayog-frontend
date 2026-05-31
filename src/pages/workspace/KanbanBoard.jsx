import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit3, Loader2, Plus, RefreshCw } from 'lucide-react'
import { toast } from '../../components/common/Toast'
import userService from '../../apis/services/users/user.service'
import featuresService from '../../apis/services/workspace/features.service'
import tasksService from '../../apis/services/workspace/tasks.service'
import TaskFormModal from './components/TaskFormModal'
import {
  Badge,
  MetricCard,
  SelectControl,
  WorkspacePageHeader,
} from './components/WorkspacePrimitives'
import {
  extractList,
  formatDate,
  formatMinutes,
  getErrorMessage,
  getStatusLabel,
  getStoredOrgId,
  normalizeFeature,
  normalizeTask,
  normalizeUser,
  priorityTone,
  statusTone,
  TASK_BOARD_COLUMNS,
  withOrgId,
} from './workspaceUtils'

const DEFAULT_EDITOR = { open: false, mode: 'create', task: null }

function KanbanTaskCard({ task, onEdit, onDragStart }) {
  return (
    <article
      draggable
      onDragStart={(event) => onDragStart(event, task)}
      className="rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-ink">{task.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{task.description || 'No description provided.'}</p>
        </div>
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded-lg p-1.5 text-ink-muted transition hover:bg-blue-50 hover:text-blue-600"
          title="Edit task"
        >
          <Edit3 size={14} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge className={priorityTone(task.priority)}>{task.priority}</Badge>
        {task.dueDate && <Badge className="border-surface-200 bg-surface-50 text-ink-muted">{formatDate(task.dueDate)}</Badge>}
      </div>

      <div className="mt-4 space-y-2 text-xs text-ink-muted">
        <div className="flex items-center justify-between gap-3">
          <span>Feature</span>
          <span className="max-w-[9rem] truncate font-semibold text-ink">{task.featureName || '-'}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Owner</span>
          <span className="max-w-[9rem] truncate font-semibold text-ink">{task.assignedToName || 'Unassigned'}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Budget</span>
          <span className="font-semibold text-ink">{formatMinutes(task.budgetMinutes)}</span>
        </div>
      </div>
    </article>
  )
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([])
  const [features, setFeatures] = useState([])
  const [users, setUsers] = useState([])
  const [featureId, setFeatureId] = useState('')
  const [assignedToId, setAssignedToId] = useState('')
  const [loading, setLoading] = useState(true)
  const [movingTaskId, setMovingTaskId] = useState('')
  const [saving, setSaving] = useState(false)
  const [editor, setEditor] = useState(DEFAULT_EDITOR)

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: 1,
        limit: 500,
        sortBy: 'dueDate',
        sortOrder: 'ASC',
        orgId: getStoredOrgId() || undefined,
      }
      if (featureId) params.featureId = featureId
      if (assignedToId) params.assignedToId = assignedToId

      const response = await tasksService.list(params)
      setTasks(extractList(response, 'tasks').map(normalizeTask).filter((task) => task?.id))
    } catch (error) {
      toast.error('Failed to load board', getErrorMessage(error, 'Failed to load Kanban board.'))
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [assignedToId, featureId])

  const fetchReferences = useCallback(async () => {
    try {
      const [featureResponse, userResponse] = await Promise.all([
        featuresService.list({ page: 1, limit: 300, orgId: getStoredOrgId() || undefined }),
        userService.list({ page: 1, limit: 200 }),
      ])
      setFeatures(extractList(featureResponse, 'features').map(normalizeFeature).filter((feature) => feature?.id))
      setUsers(extractList(userResponse, 'users').map(normalizeUser).filter((user) => user?.id))
    } catch (error) {
      toast.error('Failed to load reference data', getErrorMessage(error, 'Failed to load features or users.'))
    }
  }, [])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  useEffect(() => {
    fetchReferences()
  }, [fetchReferences])

  const groupedTasks = useMemo(() => {
    const groups = Object.fromEntries(TASK_BOARD_COLUMNS.map((column) => [column.value, []]))
    tasks.forEach((task) => {
      if (!groups[task.status]) groups[task.status] = []
      groups[task.status].push(task)
    })
    return groups
  }, [tasks])

  const summary = useMemo(() => ({
    total: tasks.length,
    blocked: tasks.filter((task) => task.status === 'BLOCKED').length,
    completed: tasks.filter((task) => task.status === 'COMPLETED').length,
  }), [tasks])

  const handleDragStart = (event, task) => {
    event.dataTransfer.setData('text/plain', task.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = async (event, nextStatus) => {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/plain')
    const task = tasks.find((item) => item.id === taskId)
    if (!task || task.status === nextStatus) return

    const previousTasks = tasks
    setTasks((current) => current.map((item) => (item.id === taskId ? { ...item, status: nextStatus } : item)))

    try {
      setMovingTaskId(taskId)
      await tasksService.update(taskId, { status: nextStatus })
      toast.success('Task Moved', `"${task.title}" moved to ${getStatusLabel(TASK_BOARD_COLUMNS, nextStatus)}.`)
    } catch (error) {
      setTasks(previousTasks)
      toast.error('Move Failed', getErrorMessage(error, 'Backend rejected the status update.'))
    } finally {
      setMovingTaskId('')
    }
  }

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
      await fetchBoard()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to save task.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <WorkspacePageHeader
        title="Kanban Board"
        description="Move tasks through backend-supported workflow statuses only: To Do, In Progress, In Review, Blocked, Completed, and Cancelled."
        actionLabel="New Task"
        actionIcon="Plus"
        onAction={() => setEditor({ open: true, mode: 'create', task: null })}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Board Tasks" value={summary.total} helper="Loaded from tasks/list" icon="LayoutDashboard" tone="blue" />
        <MetricCard label="Blocked" value={summary.blocked} helper="Needs intervention" icon="Ban" tone="red" />
        <MetricCard label="Completed" value={summary.completed} helper="Done status" icon="CheckCircle2" tone="emerald" />
      </div>

      <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-card">
        <div className="grid gap-3 lg:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_auto]">
          <SelectControl value={featureId} onChange={setFeatureId}>
            <option value="">All features</option>
            {features.map((feature) => (
              <option key={feature.id} value={feature.id}>{feature.name}</option>
            ))}
          </SelectControl>
          <SelectControl value={assignedToId} onChange={setAssignedToId}>
            <option value="">All assignees</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </SelectControl>
          <button
            type="button"
            onClick={fetchBoard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink-muted transition hover:bg-surface-100 hover:text-ink disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            Refresh
          </button>
        </div>
      </div>

      <div className="min-h-[32rem] overflow-x-auto pb-2">
        <div className="grid min-w-[1180px] grid-cols-6 gap-4">
          {TASK_BOARD_COLUMNS.map((column) => {
            const columnTasks = groupedTasks[column.value] || []
            return (
              <section
                key={column.value}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, column.value)}
                className="flex max-h-[calc(100vh-22rem)] min-h-[32rem] flex-col rounded-xl border border-surface-200 bg-surface-100/70"
              >
                <div className="sticky top-0 z-10 border-b border-surface-200 bg-white/95 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge className={statusTone(column.value)}>{column.label}</Badge>
                    <span className="rounded-full bg-surface-100 px-2 py-1 text-xs font-semibold text-ink-muted">{columnTasks.length}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-3">
                  {loading ? (
                    <div className="rounded-xl border border-dashed border-surface-300 bg-white px-4 py-8 text-center text-sm text-ink-muted">
                      <Loader2 size={20} className="mx-auto mb-2 animate-spin text-blue-600" />
                      Loading...
                    </div>
                  ) : columnTasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-surface-300 bg-white px-4 py-8 text-center text-sm text-ink-muted">
                      Drop tasks here
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div key={task.id} className={movingTaskId === task.id ? 'opacity-60' : ''}>
                        <KanbanTaskCard
                          task={task}
                          onEdit={(selectedTask) => setEditor({ open: true, mode: 'edit', task: selectedTask })}
                          onDragStart={handleDragStart}
                        />
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setEditor({ open: true, mode: 'create', task: { status: column.value, featureId } })}
                  className="m-3 inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-surface-300 bg-white px-3 py-2 text-sm font-semibold text-ink-muted transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Plus size={15} />
                  Add task
                </button>
              </section>
            )
          })}
        </div>
      </div>

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
    </div>
  )
}
