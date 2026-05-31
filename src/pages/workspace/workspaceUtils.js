export const FEATURE_STATUS_OPTIONS = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export const TASK_STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export const ISSUE_STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REOPENED', label: 'Reopened' },
]

export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

export const ISSUE_PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
]

export const SEVERITY_OPTIONS = [
  { value: 'MINOR', label: 'Minor' },
  { value: 'MAJOR', label: 'Major' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'BLOCKER', label: 'Blocker' },
]

export const ISSUE_TYPE_OPTIONS = [
  { value: 'ISSUE', label: 'Issue' },
  { value: 'BUG', label: 'Bug' },
]

export const WORK_TARGET_OPTIONS = [
  { value: 'TASK', label: 'Task' },
  { value: 'SUB_TASK', label: 'Subtask' },
  { value: 'ISSUE', label: 'Issue/Bug' },
]

export const TASK_BOARD_COLUMNS = TASK_STATUS_OPTIONS

const EMPTY_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
}

export function safelyParseJson(value) {
  try {
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function getStoredOrgId() {
  const organization = safelyParseJson(localStorage.getItem('organization'))
  return getEntityId(organization) || organization?.orgId || ''
}

export function getStoredUserId() {
  const user = safelyParseJson(localStorage.getItem('users'))
  if (Array.isArray(user)) return getEntityId(user[0])
  return getEntityId(user)
}

export function withOrgId(payload) {
  const orgId = getStoredOrgId()
  return orgId ? { ...payload, orgId } : payload
}

export function getEntityId(entity, extraKeys = []) {
  if (!entity) return ''
  const keys = [
    ...extraKeys,
    'id',
    'uuid',
    '_id',
    'projectId',
    'featureId',
    'taskId',
    'subTaskId',
    'issueId',
    'workLogId',
    'userId',
    'ownerId',
    'assignedToId',
    'organizationId',
    'orgId',
  ]
  const value = keys
    .map((key) => entity?.[key])
    .find((candidate) => candidate !== undefined && candidate !== null && candidate !== '')
  return value !== undefined && value !== null ? String(value) : ''
}

export function getDisplayName(entity) {
  if (!entity) return ''
  if (typeof entity === 'string') return entity
  const firstName = entity.firstName || entity.first_name || ''
  const lastName = entity.lastName || entity.last_name || ''
  const name = `${firstName} ${lastName}`.trim()
  return entity.name || entity.title || name || entity.email || getEntityId(entity)
}

export function extractList(response, resourceKey) {
  if (Array.isArray(response)) return response

  const candidates = [
    response?.[resourceKey],
    resourceKey ? response?.[resourceKey.toLowerCase()] : undefined,
    response?.data,
    response?.items,
    response?.results,
    response?.rows,
    response?.data?.[resourceKey],
    resourceKey ? response?.data?.[resourceKey.toLowerCase()] : undefined,
    response?.data?.items,
    response?.data?.results,
    response?.data?.rows,
    response?.data?.data,
  ]

  return candidates.find(Array.isArray) || []
}

export function extractEntity(response, resourceKey) {
  const candidates = [
    response?.[resourceKey],
    response?.data?.[resourceKey],
    response?.data?.data,
    response?.data,
    response,
  ]

  return candidates.find((candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate)) || null
}

export function extractPagination(response, fallbackLimit = 10, fallbackCount = 0) {
  if (!response || typeof response !== 'object') {
    return { ...EMPTY_PAGINATION, limit: fallbackLimit, total: fallbackCount }
  }

  const sources = [
    response,
    response?.data,
    response?.meta,
    response?.pagination,
    response?.data?.meta,
    response?.data?.pagination,
  ]

  const pick = (keys) => {
    for (const source of sources) {
      if (!source) continue
      for (const key of keys) {
        const value = source[key]
        if (value !== undefined && value !== null) return value
      }
    }
    return undefined
  }

  const page = Number(pick(['page', 'currentPage', 'pageNumber'])) || 1
  const limit = Number(pick(['limit', 'pageSize', 'perPage'])) || fallbackLimit
  const total = Number(pick(['total', 'count', 'totalItems', 'total_count'])) || fallbackCount
  const totalPages = Number(pick(['totalPages', 'pages', 'total_pages'])) || Math.max(1, Math.ceil(total / Math.max(1, limit)))

  return { page, limit, total, totalPages }
}

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const message = error?.response?.data?.message || error?.response?.data?.error || error?.message
  return Array.isArray(message) ? message.join(', ') : message || fallback
}

export function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function toInputDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function formatMinutes(minutes) {
  const value = Number(minutes) || 0
  const hours = Math.floor(value / 60)
  const remaining = value % 60
  if (hours > 0 && remaining > 0) return `${hours}h ${remaining}m`
  if (hours > 0) return `${hours}h`
  return `${remaining}m`
}

export function cleanPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => (
      value !== ''
      && value !== undefined
      && value !== null
      && !(Array.isArray(value) && value.length === 0)
    ))
  )
}

export function validateDates(startDate, dueDate) {
  if (!startDate || !dueDate) return true
  return new Date(dueDate).getTime() >= new Date(startDate).getTime()
}

export function normalizeProject(project) {
  if (!project || typeof project !== 'object') return null
  const department = project.department || project.departmentObject || null
  return {
    id: getEntityId(project, ['projectId']),
    name: project.name || project.projectName || 'Untitled Project',
    status: project.status || 'PLANNING',
    description: project.description || '',
    startDate: project.startDate || project.start_date || '',
    endDate: project.endDate || project.end_date || '',
    budgetMinutes: Number(project.budgetMinutes || 0),
    departmentId: project.departmentId || project.department_id || getEntityId(department),
    departmentName: getDisplayName(department) || project.departmentName || '',
    raw: project,
  }
}

export function normalizeUser(user) {
  if (!user || typeof user !== 'object') return null
  return {
    id: getEntityId(user, ['userId']),
    name: getDisplayName(user) || 'Unknown User',
    email: user.email || '',
    raw: user,
  }
}

export function normalizeFeature(feature) {
  if (!feature || typeof feature !== 'object') return null
  const project = feature.project || feature.projectObject || null
  const owner = feature.owner || feature.ownerUser || feature.createdBy || null
  return {
    id: getEntityId(feature, ['featureId']),
    name: feature.name || 'Untitled Feature',
    description: feature.description || '',
    status: feature.status || 'PLANNED',
    priority: feature.priority || 'MEDIUM',
    projectId: feature.projectId || getEntityId(project, ['projectId']),
    projectName: getDisplayName(project) || feature.projectName || '',
    ownerId: feature.ownerId || getEntityId(owner, ['userId']),
    ownerName: getDisplayName(owner),
    startDate: feature.startDate || feature.start_date || '',
    dueDate: feature.dueDate || feature.due_date || '',
    budgetMinutes: Number(feature.budgetMinutes || 0),
    isActive: feature.isActive !== false,
    raw: feature,
  }
}

export function normalizeTask(task) {
  if (!task || typeof task !== 'object') return null
  const feature = task.feature || task.featureObject || null
  const project = task.project || feature?.project || null
  const assignee = task.assignedTo || task.assignee || task.assignedUser || null
  return {
    id: getEntityId(task, ['taskId']),
    title: task.title || task.name || 'Untitled Task',
    description: task.description || '',
    status: task.status || 'TODO',
    priority: task.priority || 'MEDIUM',
    featureId: task.featureId || getEntityId(feature, ['featureId']),
    featureName: getDisplayName(feature) || task.featureName || '',
    projectId: task.projectId || getEntityId(project, ['projectId']) || feature?.projectId || '',
    projectName: getDisplayName(project) || task.projectName || feature?.project?.name || '',
    assignedToId: task.assignedToId || getEntityId(assignee, ['userId']),
    assignedToName: getDisplayName(assignee),
    startDate: task.startDate || task.start_date || '',
    dueDate: task.dueDate || task.due_date || '',
    budgetMinutes: Number(task.budgetMinutes || 0),
    isActive: task.isActive !== false,
    raw: task,
  }
}

export function normalizeSubTask(subtask) {
  if (!subtask || typeof subtask !== 'object') return null
  const task = subtask.task || subtask.parentTask || null
  const assignee = subtask.assignedTo || subtask.assignee || null
  return {
    id: getEntityId(subtask, ['subTaskId']),
    title: subtask.title || subtask.name || 'Untitled Subtask',
    description: subtask.description || '',
    status: subtask.status || 'TODO',
    priority: subtask.priority || 'MEDIUM',
    taskId: subtask.taskId || getEntityId(task, ['taskId']),
    taskTitle: getDisplayName(task) || subtask.taskTitle || '',
    featureId: subtask.featureId || task?.featureId || '',
    projectId: subtask.projectId || task?.projectId || '',
    assignedToId: subtask.assignedToId || getEntityId(assignee, ['userId']),
    assignedToName: getDisplayName(assignee),
    startDate: subtask.startDate || subtask.start_date || '',
    dueDate: subtask.dueDate || subtask.due_date || '',
    budgetMinutes: Number(subtask.budgetMinutes || 0),
    raw: subtask,
  }
}

export function normalizeIssue(issue) {
  if (!issue || typeof issue !== 'object') return null
  const project = issue.project || null
  const feature = issue.feature || null
  const task = issue.task || null
  const subtask = issue.subTask || issue.subtask || null
  const assignee = issue.assignedTo || issue.assignee || null
  return {
    id: getEntityId(issue, ['issueId']),
    title: issue.title || issue.name || 'Untitled Issue',
    description: issue.description || '',
    type: issue.type || 'ISSUE',
    status: issue.status || 'OPEN',
    priority: issue.priority || 'MEDIUM',
    severity: issue.severity || 'MINOR',
    projectId: issue.projectId || getEntityId(project, ['projectId']),
    projectName: getDisplayName(project) || issue.projectName || '',
    featureId: issue.featureId || getEntityId(feature, ['featureId']),
    featureName: getDisplayName(feature) || issue.featureName || '',
    taskId: issue.taskId || getEntityId(task, ['taskId']),
    taskTitle: getDisplayName(task) || issue.taskTitle || '',
    subTaskId: issue.subTaskId || getEntityId(subtask, ['subTaskId']),
    subTaskTitle: getDisplayName(subtask) || issue.subTaskTitle || '',
    assignedToId: issue.assignedToId || getEntityId(assignee, ['userId']),
    assignedToName: getDisplayName(assignee),
    startDate: issue.startDate || issue.start_date || '',
    dueDate: issue.dueDate || issue.due_date || '',
    budgetMinutes: Number(issue.budgetMinutes || 0),
    resolution: issue.resolution || '',
    resolvedAt: issue.resolvedAt || '',
    raw: issue,
  }
}

export function normalizeWorkLog(workLog) {
  if (!workLog || typeof workLog !== 'object') return null
  const user = workLog.user || workLog.createdBy || null
  const task = workLog.task || null
  const subtask = workLog.subTask || workLog.subtask || null
  const issue = workLog.issue || null
  const target = task || subtask || issue
  return {
    id: getEntityId(workLog, ['workLogId']),
    targetType: workLog.targetType || (task ? 'TASK' : subtask ? 'SUB_TASK' : issue ? 'ISSUE' : ''),
    targetId: workLog.targetId || getEntityId(target),
    targetName: getDisplayName(target) || workLog.targetName || '',
    logDate: workLog.logDate || workLog.log_date || '',
    minutesSpent: Number(workLog.minutesSpent || 0),
    description: workLog.description || '',
    userId: workLog.userId || getEntityId(user, ['userId']),
    userName: getDisplayName(user),
    projectId: workLog.projectId || '',
    featureId: workLog.featureId || '',
    taskId: workLog.taskId || '',
    subTaskId: workLog.subTaskId || '',
    issueId: workLog.issueId || '',
    raw: workLog,
  }
}

export function getStatusLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value || 'Unknown'
}

export function statusTone(status) {
  const map = {
    PLANNED: 'bg-sky-50 text-sky-700 border-sky-100',
    TODO: 'bg-slate-50 text-slate-700 border-slate-200',
    OPEN: 'bg-slate-50 text-slate-700 border-slate-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-100',
    IN_REVIEW: 'bg-violet-50 text-violet-700 border-violet-100',
    ON_HOLD: 'bg-amber-50 text-amber-700 border-amber-100',
    BLOCKED: 'bg-red-50 text-red-700 border-red-100',
    REOPENED: 'bg-orange-50 text-orange-700 border-orange-100',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    CLOSED: 'bg-zinc-50 text-zinc-700 border-zinc-200',
    CANCELLED: 'bg-zinc-50 text-zinc-600 border-zinc-200',
  }
  return map[status] || 'bg-surface-100 text-ink-muted border-surface-200'
}

export function priorityTone(priority) {
  const map = {
    LOW: 'bg-slate-50 text-slate-700 border-slate-200',
    MEDIUM: 'bg-sky-50 text-sky-700 border-sky-100',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-100',
    URGENT: 'bg-red-50 text-red-700 border-red-100',
    CRITICAL: 'bg-red-50 text-red-700 border-red-100',
    BLOCKER: 'bg-red-50 text-red-700 border-red-100',
    MAJOR: 'bg-orange-50 text-orange-700 border-orange-100',
    MINOR: 'bg-slate-50 text-slate-700 border-slate-200',
  }
  return map[priority] || 'bg-surface-100 text-ink-muted border-surface-200'
}
