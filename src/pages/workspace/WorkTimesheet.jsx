import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit3, Loader2, Trash2 } from 'lucide-react'
import { toast } from '../../components/common/Toast'
import projectsService from '../../apis/services/projects/projects.service'
import userService from '../../apis/services/users/user.service'
import issuesService from '../../apis/services/workspace/issues.service'
import subtasksService from '../../apis/services/workspace/subtasks.service'
import tasksService from '../../apis/services/workspace/tasks.service'
import workLogsService from '../../apis/services/workspace/work-logs.service'
import WorkLogFormModal from './components/WorkLogFormModal'
import {
  Badge,
  ConfirmModal,
  EmptyState,
  FilterBar,
  MetricCard,
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
  normalizeIssue,
  normalizeProject,
  normalizeSubTask,
  normalizeTask,
  normalizeUser,
  normalizeWorkLog,
  priorityTone,
  withOrgId,
  WORK_TARGET_OPTIONS,
} from './workspaceUtils'

const DEFAULT_EDITOR = { open: false, mode: 'create', workLog: null }
const today = () => new Date().toISOString().slice(0, 10)

function extractWorkLogs(response) {
  const byWorkLogs = extractList(response, 'workLogs')
  if (byWorkLogs.length) return byWorkLogs
  const byLogs = extractList(response, 'logs')
  if (byLogs.length) return byLogs
  const byReports = extractList(response, 'reports')
  if (byReports.length) return byReports
  return extractList(response, 'work_logs')
}

function reportTotalMinutes(response, items) {
  const candidates = [
    response?.totalMinutes,
    response?.minutesSpent,
    response?.data?.totalMinutes,
    response?.data?.minutesSpent,
    response?.summary?.totalMinutes,
    response?.data?.summary?.totalMinutes,
  ]
  const direct = candidates.find((value) => value !== undefined && value !== null)
  if (direct !== undefined) return Number(direct) || 0
  return items.reduce((sum, item) => sum + Number(item.minutesSpent || 0), 0)
}

function toDateOnly(date) {
  return date.toISOString().slice(0, 10)
}

function getRangeForReport(reportType, value) {
  if (reportType === 'list') return {}

  const anchor = value ? new Date(`${value}T00:00:00.000Z`) : new Date()
  if (Number.isNaN(anchor.getTime())) return {}

  const start = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate()))
  const end = new Date(start)

  if (reportType === 'weekly') {
    const day = start.getUTCDay()
    const daysSinceMonday = (day + 6) % 7
    start.setUTCDate(start.getUTCDate() - daysSinceMonday)
    end.setUTCDate(start.getUTCDate() + 6)
  }

  if (reportType === 'monthly') {
    start.setUTCDate(1)
    end.setUTCMonth(start.getUTCMonth() + 1, 0)
  }

  return {
    fromDate: toDateOnly(start),
    toDate: toDateOnly(end),
  }
}

async function getReportSummary(reportType, params) {
  if (reportType === 'daily') return workLogsService.daily(params)
  if (reportType === 'weekly') return workLogsService.weekly(params)
  if (reportType === 'monthly') return workLogsService.monthly(params)
  return null
}

export default function WorkTimesheet() {
  const [workLogs, setWorkLogs] = useState([])
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [subtasks, setSubtasks] = useState([])
  const [issues, setIssues] = useState([])
  const [users, setUsers] = useState([])
  const [reportType, setReportType] = useState('list')
  const [date, setDate] = useState(today())
  const [projectId, setProjectId] = useState('')
  const [userId, setUserId] = useState('')
  const [targetType, setTargetType] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [reportMinutes, setReportMinutes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [editor, setEditor] = useState(DEFAULT_EDITOR)

  const fetchWorkLogs = useCallback(async () => {
    try {
      setLoading(true)
      const commonFilters = {
        projectId: projectId || undefined,
        userId: userId || undefined,
        orgId: getStoredOrgId() || undefined,
      }

      const rangeFilters = getRangeForReport(reportType, date)
      const listParams = {
        page,
        limit,
        targetType: targetType || undefined,
        ...rangeFilters,
        ...commonFilters,
      }

      let response
      let items = []
      let totalMinutes = 0

      if (reportType === 'list') {
        response = await workLogsService.list(listParams)
        items = extractWorkLogs(response)
          .map(normalizeWorkLog)
          .filter((workLog) => workLog?.id)
        totalMinutes = reportTotalMinutes(response, items)
        setPagination(extractPagination(response, limit, items.length))
      } else {
        response = await getReportSummary(reportType, { date, ...commonFilters })
        const allItems = extractWorkLogs(response)
          .map(normalizeWorkLog)
          .filter((workLog) => workLog?.id)
          .filter((workLog) => !targetType || workLog.targetType === targetType)

        totalMinutes = targetType ? allItems.reduce((sum, item) => sum + Number(item.minutesSpent || 0), 0) : reportTotalMinutes(response, allItems)
        const total = allItems.length
        const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)))
        const safePage = Math.min(page, totalPages)
        const start = (safePage - 1) * limit
        items = allItems.slice(start, start + limit)
        setPagination({ page: safePage, limit, total, totalPages })

        if (safePage !== page) {
          setPage(safePage)
        }
      }

      setWorkLogs(items)
      setReportMinutes(totalMinutes)
    } catch (error) {
      toast.error('Failed to load work logs', getErrorMessage(error, 'Failed to load work logs.'))
      setWorkLogs([])
      setReportMinutes(0)
      setPagination({ page, limit, total: 0, totalPages: 1 })
    } finally {
      setLoading(false)
    }
  }, [date, limit, page, projectId, reportType, targetType, userId])

  const fetchReferences = useCallback(async () => {
    try {
      const orgId = getStoredOrgId() || undefined
      const [projectResponse, taskResponse, subtaskResponse, issueResponse, userResponse] = await Promise.all([
        projectsService.list({ page: 1, limit: 200, orgId }),
        tasksService.list({ page: 1, limit: 500, orgId }),
        subtasksService.list({ page: 1, limit: 500, orgId }),
        issuesService.list({ page: 1, limit: 500, orgId }),
        userService.list({ page: 1, limit: 200 }),
      ])
      setProjects(extractList(projectResponse, 'projects').map(normalizeProject).filter((project) => project?.id))
      setTasks(extractList(taskResponse, 'tasks').map(normalizeTask).filter((task) => task?.id))
      setSubtasks(extractList(subtaskResponse, 'subtasks').map(normalizeSubTask).filter((subtask) => subtask?.id))
      setIssues(extractList(issueResponse, 'issues').map(normalizeIssue).filter((issue) => issue?.id))
      setUsers(extractList(userResponse, 'users').map(normalizeUser).filter((user) => user?.id))
    } catch (error) {
      toast.error('Failed to load reference data', getErrorMessage(error, 'Failed to load workspace references.'))
    }
  }, [])

  useEffect(() => {
    fetchWorkLogs()
  }, [fetchWorkLogs])

  useEffect(() => {
    fetchReferences()
  }, [fetchReferences])

  const summary = useMemo(() => {
    const billableDays = new Set(workLogs.map((log) => log.logDate).filter(Boolean)).size
    return {
      totalMinutes: reportMinutes,
      entries: pagination.total || workLogs.length,
      billableDays,
    }
  }, [pagination.total, reportMinutes, workLogs])

  const activeRange = useMemo(() => getRangeForReport(reportType, date), [date, reportType])

  const handleSave = async (payload) => {
    try {
      setSaving(true)
      if (editor.mode === 'create') {
        await workLogsService.create(withOrgId(payload))
        toast.success('Work Logged', `${formatMinutes(payload.minutesSpent)} has been logged.`)
      } else {
        await workLogsService.update(editor.workLog.id, payload)
        toast.success('Work Log Updated', 'The work log has been updated.')
      }
      setEditor(DEFAULT_EDITOR)
      await fetchWorkLogs()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to save work log.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await workLogsService.delete(deleteTarget.id)
      toast.success('Work Log Deleted', 'The work log has been deleted.')
      setDeleteTarget(null)
      await fetchWorkLogs()
    } catch (error) {
      toast.error('Delete Failed', getErrorMessage(error, 'Failed to delete work log.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <WorkspacePageHeader
        title="Work Timesheet"
        description="Log actual execution time and review full daily, weekly, and monthly work log records."
        actionLabel="Log Work"
        actionIcon="Timer"
        onAction={() => setEditor({ open: true, mode: 'create', workLog: null })}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Tracked Time" value={formatMinutes(summary.totalMinutes)} helper="Current view total" icon="Timer" tone="blue" />
        <MetricCard label="Entries" value={summary.entries} helper="Visible work logs" icon="ClipboardList" tone="amber" />
        <MetricCard label="Active Days" value={summary.billableDays} helper="Distinct log dates" icon="CalendarDays" tone="emerald" />
      </div>

      <div className="rounded-xl border border-surface-200 bg-white p-2 shadow-card">
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'list', label: 'All Logs' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { setReportType(option.value); setPage(1) }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${reportType === option.value ? 'bg-blue-600 text-white shadow-sm' : 'text-ink-muted hover:bg-surface-100 hover:text-ink'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <FilterBar
        search={date}
        onSearchChange={(value) => { setDate(value); setPage(1) }}
        searchPlaceholder="YYYY-MM-DD"
        loading={loading}
        onRefresh={fetchWorkLogs}
      >
        <SelectControl value={projectId} onChange={(value) => { setProjectId(value); setPage(1) }}>
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </SelectControl>
        <SelectControl value={userId} onChange={(value) => { setUserId(value); setPage(1) }}>
          <option value="">All users</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </SelectControl>
        <SelectControl value={targetType} onChange={(value) => { setTargetType(value); setPage(1) }}>
          <option value="">All target types</option>
          {WORK_TARGET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </SelectControl>
      </FilterBar>

      {reportType !== 'list' && activeRange.fromDate && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Showing full work logs from <span className="font-semibold">{activeRange.fromDate}</span> to <span className="font-semibold">{activeRange.toDate}</span>.
        </div>
      )}

      <TableShell title="Work Log Register" subtitle="Actual time entries calculated from work_logs.">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="min-w-[180px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Date</th>
              <th className="w-36 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Target Type</th>
              <th className="min-w-[260px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Work Item</th>
              <th className="min-w-[160px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">User</th>
              <th className="w-32 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Time</th>
              <th className="min-w-[280px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Description</th>
              <th className="w-28 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <Loader2 size={24} className="mx-auto mb-2 animate-spin text-blue-600" />
                  <p className="text-sm text-ink-muted">Loading work logs...</p>
                </td>
              </tr>
            ) : workLogs.length === 0 ? (
              <tr>
                <td colSpan={7}><EmptyState title="No work logs found" description="Log work or adjust the filters." icon="Timer" /></td>
              </tr>
            ) : (
              workLogs.map((workLog) => (
                <tr key={workLog.id} className="border-b border-surface-100 last:border-0 hover:bg-surface-100/40">
                  <td className="px-5 py-4 text-ink-muted">{formatDate(workLog.logDate)}</td>
                  <td className="px-5 py-4"><Badge className={priorityTone(workLog.targetType)}>{workLog.targetType}</Badge></td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{workLog.targetName || workLog.targetId || '-'}</p>
                    <p className="mt-1 text-xs text-ink-muted">{workLog.targetId}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-muted">{workLog.userName || workLog.userId || '-'}</td>
                  <td className="px-5 py-4 text-ink-muted">{formatMinutes(workLog.minutesSpent)}</td>
                  <td className="px-5 py-4 text-ink-muted">{workLog.description || '-'}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditor({ open: true, mode: 'edit', workLog })}
                        className="rounded-lg p-2 text-ink-muted transition hover:bg-blue-50 hover:text-blue-600"
                        title="Edit work log"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(workLog)}
                        className="rounded-lg p-2 text-ink-muted transition hover:bg-red-50 hover:text-red-600"
                        title="Delete work log"
                      >
                        <Trash2 size={15} />
                      </button>
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

      <WorkLogFormModal
        open={editor.open}
        mode={editor.mode}
        workLog={editor.workLog}
        saving={saving}
        tasks={tasks}
        subtasks={subtasks}
        issues={issues}
        users={users}
        onClose={() => !saving && setEditor(DEFAULT_EDITOR)}
        onSubmit={handleSave}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete work log?"
        description="This will remove the selected time entry."
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
