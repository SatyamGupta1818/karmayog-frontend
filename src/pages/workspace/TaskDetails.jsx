import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from '../../components/common/Toast'
import userService from '../../apis/services/users/user.service'
import featuresService from '../../apis/services/workspace/features.service'
import tasksService from '../../apis/services/workspace/tasks.service'
import CommentsPanel from './components/CommentsPanel'
import TaskFormModal from './components/TaskFormModal'
import { Badge, MetricCard } from './components/WorkspacePrimitives'
import {
  extractEntity,
  extractList,
  formatDate,
  formatMinutes,
  getErrorMessage,
  getStoredOrgId,
  normalizeFeature,
  normalizeTask,
  normalizeUser,
  priorityTone,
  statusTone,
} from './workspaceUtils'

export default function TaskDetails() {
  const location = useLocation()
  const navigate = useNavigate()
  const taskId = new URLSearchParams(location.search).get('taskId') || ''
  const [task, setTask] = useState(null)
  const [features, setFeatures] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchTask = useCallback(async () => {
    if (!taskId) return
    try {
      setLoading(true)
      const response = await tasksService.getById(taskId)
      setTask(normalizeTask(extractEntity(response, 'task')))
    } catch (error) {
      toast.error('Failed to load task', getErrorMessage(error, 'Failed to load task details.'))
    } finally {
      setLoading(false)
    }
  }, [taskId])

  const fetchReferences = useCallback(async () => {
    try {
      const [featureResponse, userResponse] = await Promise.all([
        featuresService.list({ page: 1, limit: 500, orgId: getStoredOrgId() || undefined }),
        userService.list({ page: 1, limit: 300 }),
      ])
      setFeatures(extractList(featureResponse, 'features').map(normalizeFeature).filter((item) => item?.id))
      setUsers(extractList(userResponse, 'users').map(normalizeUser).filter((item) => item?.id))
    } catch (error) {
      toast.error('Failed to load reference data', getErrorMessage(error, 'Failed to load features or users.'))
    }
  }, [])

  useEffect(() => {
    fetchTask()
    fetchReferences()
  }, [fetchReferences, fetchTask])

  const handleSave = async (payload) => {
    if (!task?.id) return
    try {
      setSaving(true)
      await tasksService.update(task.id, payload)
      toast.success('Task Updated', `"${payload.title}" has been updated.`)
      setEditing(false)
      await fetchTask()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to update task.'))
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

  if (!task) {
    return (
      <div className="rounded-xl border border-surface-200 bg-white p-8 shadow-card">
        <p className="text-sm text-ink-muted">Task could not be found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/workspace/tasks')}
            className="mb-3 inline-flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-100 hover:text-ink"
          >
            <ArrowLeft size={15} />
            Back to tasks
          </button>
          <h2 className="text-2xl font-semibold text-ink">{task.title}</h2>
          <p className="mt-1 text-sm text-ink-muted">Task details, long-form guidance, and comments.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Edit3 size={16} />
          Edit Task
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Status" value={task.status} helper="Task workflow" icon="Activity" tone="blue" />
        <MetricCard label="Priority" value={task.priority} helper="Execution priority" icon="Flame" tone="amber" />
        <MetricCard label="Budget" value={formatMinutes(task.budgetMinutes)} helper="Planned effort" icon="Clock3" tone="emerald" />
        <MetricCard label="Due Date" value={formatDate(task.dueDate)} helper="Target completion" icon="CalendarDays" tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-surface-200 bg-white p-6 shadow-card">
            <div className="flex flex-wrap gap-2">
              <Badge className={statusTone(task.status)}>{task.status}</Badge>
              <Badge className={priorityTone(task.priority)}>{task.priority}</Badge>
            </div>
            <h3 className="mt-5 text-sm font-semibold uppercase tracking-wider text-ink-muted">Full Description / Task Guidance</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">
              {task.description || 'No description or task guidance has been provided.'}
            </p>
          </section>

          <CommentsPanel targetType="TASK" targetId={task.id} title="Task Comments" />
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Hierarchy</p>
            <button
              type="button"
              onClick={() => task.featureId && navigate(`/workspace/features/details?featureId=${task.featureId}`)}
              className="mt-3 flex w-full items-center justify-between gap-3 rounded-lg border border-surface-200 px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-surface-50"
            >
              <span className="truncate">{task.featureName || task.featureId || 'No feature'}</span>
              <ExternalLink size={14} className="text-ink-muted" />
            </button>
            {task.projectId && (
              <button
                type="button"
                onClick={() => navigate(`/workspace/projects/details?projectId=${task.projectId}`)}
                className="mt-2 flex w-full items-center justify-between gap-3 rounded-lg border border-surface-200 px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-surface-50"
              >
                <span className="truncate">{task.projectName || task.projectId}</span>
                <ExternalLink size={14} className="text-ink-muted" />
              </button>
            )}
          </div>

          <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Assignment</p>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-ink-muted">Assignee</dt>
                <dd className="mt-1 font-semibold text-ink">{task.assignedToName || 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Start</dt>
                <dd className="mt-1 font-semibold text-ink">{formatDate(task.startDate)}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Due</dt>
                <dd className="mt-1 font-semibold text-ink">{formatDate(task.dueDate)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <TaskFormModal
        open={editing}
        mode="edit"
        task={task}
        saving={saving}
        features={features}
        users={users}
        onClose={() => !saving && setEditing(false)}
        onSubmit={handleSave}
      />
    </div>
  )
}
