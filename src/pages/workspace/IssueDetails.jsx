import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Edit3, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from '../../components/common/Toast'
import projectsService from '../../apis/services/projects/projects.service'
import userService from '../../apis/services/users/user.service'
import featuresService from '../../apis/services/workspace/features.service'
import issuesService from '../../apis/services/workspace/issues.service'
import subtasksService from '../../apis/services/workspace/subtasks.service'
import tasksService from '../../apis/services/workspace/tasks.service'
import CommentsPanel from './components/CommentsPanel'
import IssueFormModal from './components/IssueFormModal'
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
  normalizeIssue,
  normalizeProject,
  normalizeSubTask,
  normalizeTask,
  normalizeUser,
  priorityTone,
  statusTone,
} from './workspaceUtils'

export default function IssueDetails() {
  const location = useLocation()
  const navigate = useNavigate()
  const issueId = new URLSearchParams(location.search).get('issueId') || ''
  const [issue, setIssue] = useState(null)
  const [projects, setProjects] = useState([])
  const [features, setFeatures] = useState([])
  const [tasks, setTasks] = useState([])
  const [subtasks, setSubtasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resolving, setResolving] = useState(false)

  const fetchIssue = useCallback(async () => {
    if (!issueId) return
    try {
      setLoading(true)
      const response = await issuesService.getById(issueId)
      setIssue(normalizeIssue(extractEntity(response, 'issue')))
    } catch (error) {
      toast.error('Failed to load issue', getErrorMessage(error, 'Failed to load issue details.'))
    } finally {
      setLoading(false)
    }
  }, [issueId])

  const fetchReferences = useCallback(async () => {
    try {
      const orgId = getStoredOrgId() || undefined
      const [projectResponse, featureResponse, taskResponse, subtaskResponse, userResponse] = await Promise.all([
        projectsService.list({ page: 1, limit: 300, orgId }),
        featuresService.list({ page: 1, limit: 500, orgId }),
        tasksService.list({ page: 1, limit: 800, orgId }),
        subtasksService.list({ page: 1, limit: 800, orgId }),
        userService.list({ page: 1, limit: 300 }),
      ])
      setProjects(extractList(projectResponse, 'projects').map(normalizeProject).filter((item) => item?.id))
      setFeatures(extractList(featureResponse, 'features').map(normalizeFeature).filter((item) => item?.id))
      setTasks(extractList(taskResponse, 'tasks').map(normalizeTask).filter((item) => item?.id))
      setSubtasks(extractList(subtaskResponse, 'subtasks').map(normalizeSubTask).filter((item) => item?.id))
      setUsers(extractList(userResponse, 'users').map(normalizeUser).filter((item) => item?.id))
    } catch (error) {
      toast.error('Failed to load reference data', getErrorMessage(error, 'Failed to load workspace references.'))
    }
  }, [])

  useEffect(() => {
    fetchIssue()
    fetchReferences()
  }, [fetchIssue, fetchReferences])

  const handleSave = async (payload) => {
    if (!issue?.id) return
    try {
      setSaving(true)
      await issuesService.update(issue.id, payload)
      toast.success('Issue Updated', `"${payload.title}" has been updated.`)
      setEditing(false)
      await fetchIssue()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to update issue.'))
    } finally {
      setSaving(false)
    }
  }

  const handleResolve = async () => {
    if (!issue?.id) return
    try {
      setResolving(true)
      await issuesService.update(issue.id, {
        status: 'RESOLVED',
        resolution: issue.resolution || 'Resolved from issue details.',
      })
      toast.success('Issue Resolved', `"${issue.title}" has been marked resolved.`)
      await fetchIssue()
    } catch (error) {
      toast.error('Resolve Failed', getErrorMessage(error, 'Failed to resolve issue.'))
    } finally {
      setResolving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-surface-200 bg-white p-8 shadow-card">
        <Loader2 size={24} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="rounded-xl border border-surface-200 bg-white p-8 shadow-card">
        <p className="text-sm text-ink-muted">Issue could not be found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/workspace/issues')}
            className="mb-3 inline-flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-100 hover:text-ink"
          >
            <ArrowLeft size={15} />
            Back to issues
          </button>
          <h2 className="text-2xl font-semibold text-ink">{issue.title}</h2>
          <p className="mt-1 text-sm text-ink-muted">Issue details, full reproduction notes, resolution, and comments.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PermissionGuard permission="issue details.UPDATE">
            <button
              type="button"
              onClick={handleResolve}
              disabled={resolving || issue.status === 'RESOLVED' || issue.status === 'CLOSED'}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
            >
              {resolving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Resolve
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Edit3 size={16} />
              Edit Issue
            </button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Status" value={issue.status} helper="Issue workflow" icon="Activity" tone="blue" />
        <MetricCard label="Priority" value={issue.priority} helper="Execution priority" icon="Flame" tone="amber" />
        <MetricCard label="Severity" value={issue.severity} helper={issue.type} icon="Bug" tone="red" />
        <MetricCard label="Budget" value={formatMinutes(issue.budgetMinutes)} helper="Planned effort" icon="Clock3" tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-surface-200 bg-white p-6 shadow-card">
            <div className="flex flex-wrap gap-2">
              <Badge className={issue.type === 'BUG' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}>{issue.type}</Badge>
              <Badge className={statusTone(issue.status)}>{issue.status}</Badge>
              <Badge className={priorityTone(issue.priority)}>{issue.priority}</Badge>
              <Badge className={priorityTone(issue.severity)}>{issue.severity}</Badge>
            </div>
            <h3 className="mt-5 text-sm font-semibold uppercase tracking-wider text-ink-muted">Full Description / Reproduction Notes</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">
              {issue.description || 'No issue description has been provided.'}
            </p>
            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-ink-muted">Resolution</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">
              {issue.resolution || 'No resolution has been recorded yet.'}
            </p>
          </section>

          <CommentsPanel targetType="ISSUE" targetId={issue.id} title="Issue Comments" />
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Hierarchy</p>
            {issue.projectId && (
              <button
                type="button"
                onClick={() => navigate(`/workspace/projects/details?projectId=${issue.projectId}`)}
                className="mt-3 flex w-full items-center justify-between gap-3 rounded-lg border border-surface-200 px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-surface-50"
              >
                <span className="truncate">{issue.projectName || issue.projectId}</span>
                <ExternalLink size={14} className="text-ink-muted" />
              </button>
            )}
            {issue.featureId && (
              <button
                type="button"
                onClick={() => navigate(`/workspace/features/details?featureId=${issue.featureId}`)}
                className="mt-2 flex w-full items-center justify-between gap-3 rounded-lg border border-surface-200 px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-surface-50"
              >
                <span className="truncate">{issue.featureName || issue.featureId}</span>
                <ExternalLink size={14} className="text-ink-muted" />
              </button>
            )}
            {issue.taskId && (
              <button
                type="button"
                onClick={() => navigate(`/workspace/tasks/details?taskId=${issue.taskId}`)}
                className="mt-2 flex w-full items-center justify-between gap-3 rounded-lg border border-surface-200 px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-surface-50"
              >
                <span className="truncate">{issue.taskTitle || issue.taskId}</span>
                <ExternalLink size={14} className="text-ink-muted" />
              </button>
            )}
          </div>

          <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Assignment</p>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-ink-muted">Assignee</dt>
                <dd className="mt-1 font-semibold text-ink">{issue.assignedToName || 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Due</dt>
                <dd className="mt-1 font-semibold text-ink">{formatDate(issue.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Resolved At</dt>
                <dd className="mt-1 font-semibold text-ink">{formatDate(issue.resolvedAt)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <IssueFormModal
        open={editing}
        mode="edit"
        issue={issue}
        saving={saving}
        projects={projects}
        features={features}
        tasks={tasks}
        subtasks={subtasks}
        users={users}
        onClose={() => !saving && setEditing(false)}
        onSubmit={handleSave}
      />
    </div>
  )
}
