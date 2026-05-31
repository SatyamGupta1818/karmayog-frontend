import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit3, Loader2, Trash2 } from 'lucide-react'
import { toast } from '../../components/common/Toast'
import projectsService from '../../apis/services/projects/projects.service'
import userService from '../../apis/services/users/user.service'
import commentsService from '../../apis/services/workspace/comments.service'
import featuresService from '../../apis/services/workspace/features.service'
import issuesService from '../../apis/services/workspace/issues.service'
import subtasksService from '../../apis/services/workspace/subtasks.service'
import tasksService from '../../apis/services/workspace/tasks.service'
import {
  Badge,
  ConfirmModal,
  EmptyState,
  FilterBar,
  FormActions,
  MetricCard,
  ModalShell,
  PaginationBar,
  SelectControl,
  TableShell,
  TextControl,
  WorkspacePageHeader,
} from './components/WorkspacePrimitives'
import {
  cleanPayload,
  extractList,
  extractPagination,
  formatDate,
  getDisplayName,
  getErrorMessage,
  getStoredOrgId,
  normalizeFeature,
  normalizeIssue,
  normalizeProject,
  normalizeSubTask,
  normalizeTask,
  normalizeUser,
  priorityTone,
  withOrgId,
  WORK_TARGET_OPTIONS,
} from './workspaceUtils'

const DEFAULT_EDITOR = { open: false, mode: 'create', comment: null }

const EMPTY_FORM = {
  body: '',
  targetType: 'TASK',
  targetId: '',
}

function normalizeComment(comment) {
  if (!comment || typeof comment !== 'object') return null
  const author = comment.createdBy || comment.author || comment.user || null
  return {
    id: comment.id || comment.commentId || comment._id || '',
    body: comment.body || '',
    targetType: comment.targetType || '',
    targetId: comment.targetId || '',
    projectId: comment.projectId || '',
    authorName: getDisplayName(author) || 'Team member',
    createdById: comment.createdById || '',
    createdAt: comment.createdAt || comment.created_at || '',
    updatedAt: comment.updatedAt || comment.updated_at || '',
    raw: comment,
  }
}

function targetLabelMap(items) {
  return Object.fromEntries(items.map((item) => [item.id, item.name || item.title]))
}

function getTargetsForType(type, refs) {
  if (type === 'PROJECT') return refs.projects.map((project) => ({ id: project.id, name: project.name }))
  if (type === 'FEATURE') return refs.features.map((feature) => ({ id: feature.id, name: feature.name }))
  if (type === 'SUB_TASK') return refs.subtasks.map((subtask) => ({ id: subtask.id, name: subtask.title }))
  if (type === 'ISSUE') return refs.issues.map((issue) => ({ id: issue.id, name: issue.title }))
  return refs.tasks.map((task) => ({ id: task.id, name: task.title }))
}

function CommentFormModal({ open, mode, comment, saving, refs, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    setForm({
      body: comment?.body || '',
      targetType: comment?.targetType || 'TASK',
      targetId: comment?.targetId || '',
    })
  }, [comment, open])

  const targets = useMemo(() => getTargetsForType(form.targetType, refs), [form.targetType, refs])

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
      ...(field === 'targetType' ? { targetId: '' } : null),
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.body.trim()) {
      toast.warning('Validation Error', 'Comment body is required.')
      return
    }
    if (!form.targetType || !form.targetId) {
      toast.warning('Validation Error', 'Select a comment target.')
      return
    }

    onSubmit(cleanPayload({
      body: form.body.trim(),
      targetType: form.targetType,
      targetId: form.targetId,
    }))
  }

  return (
    <ModalShell
      open={open}
      title={mode === 'create' ? 'Create Comment' : 'Edit Comment'}
      description="Add or update comments across projects, features, tasks, subtasks, and issues."
      icon="MessageSquare"
      saving={saving}
      onClose={onClose}
      footer={<FormActions formId="comment-form" saving={saving} submitLabel={mode === 'create' ? 'Create comment' : 'Save changes'} onCancel={onClose} />}
    >
      <form id="comment-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <SelectControl label="Target Type" value={form.targetType} onChange={(value) => handleChange('targetType', value)}>
            {WORK_TARGET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
            <option value="PROJECT">Project</option>
            <option value="FEATURE">Feature</option>
          </SelectControl>
          <SelectControl label="Target" value={form.targetId} onChange={(value) => handleChange('targetId', value)}>
            <option value="">Select target</option>
            {targets.map((target) => (
              <option key={target.id} value={target.id}>{target.name}</option>
            ))}
          </SelectControl>
        </div>

        <TextControl
          label="Comment"
          required
          value={form.body}
          onChange={(value) => handleChange('body', value)}
          rows={5}
          placeholder="Write the comment body..."
        />
      </form>
    </ModalShell>
  )
}

export default function Comments() {
  const [comments, setComments] = useState([])
  const [projects, setProjects] = useState([])
  const [features, setFeatures] = useState([])
  const [tasks, setTasks] = useState([])
  const [subtasks, setSubtasks] = useState([])
  const [issues, setIssues] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [targetType, setTargetType] = useState('')
  const [targetId, setTargetId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [createdById, setCreatedById] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [editor, setEditor] = useState(DEFAULT_EDITOR)

  const refs = useMemo(() => ({ projects, features, tasks, subtasks, issues }), [features, issues, projects, subtasks, tasks])
  const targetOptions = useMemo(() => (targetType ? getTargetsForType(targetType, refs) : []), [refs, targetType])
  const labels = useMemo(() => ({
    PROJECT: targetLabelMap(projects),
    FEATURE: targetLabelMap(features),
    TASK: targetLabelMap(tasks),
    SUB_TASK: targetLabelMap(subtasks),
    ISSUE: targetLabelMap(issues),
  }), [features, issues, projects, subtasks, tasks])

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        orgId: getStoredOrgId() || undefined,
      }
      if (targetType) params.targetType = targetType
      if (targetId) params.targetId = targetId
      if (projectId) params.projectId = projectId
      if (createdById) params.createdById = createdById

      const response = await commentsService.list(params)
      let items = extractList(response, 'comments')
        .map(normalizeComment)
        .filter((comment) => comment?.id)

      if (search.trim()) {
        const query = search.trim().toLowerCase()
        items = items.filter((comment) => (
          comment.body.toLowerCase().includes(query)
          || comment.authorName.toLowerCase().includes(query)
          || String(comment.targetType).toLowerCase().includes(query)
          || String(labels[comment.targetType]?.[comment.targetId] || '').toLowerCase().includes(query)
        ))
      }

      setComments(items)
      setPagination(extractPagination(response, limit, items.length))
    } catch (error) {
      toast.error('Failed to load comments', getErrorMessage(error, 'Failed to load comments.'))
      setComments([])
      setPagination({ page, limit, total: 0, totalPages: 1 })
    } finally {
      setLoading(false)
    }
  }, [createdById, labels, limit, page, projectId, search, targetId, targetType])

  const fetchReferences = useCallback(async () => {
    try {
      const orgId = getStoredOrgId() || undefined
      const [projectResponse, featureResponse, taskResponse, subtaskResponse, issueResponse, userResponse] = await Promise.all([
        projectsService.list({ page: 1, limit: 300, orgId }),
        featuresService.list({ page: 1, limit: 500, orgId }),
        tasksService.list({ page: 1, limit: 800, orgId }),
        subtasksService.list({ page: 1, limit: 800, orgId }),
        issuesService.list({ page: 1, limit: 800, orgId }),
        userService.list({ page: 1, limit: 300 }),
      ])
      setProjects(extractList(projectResponse, 'projects').map(normalizeProject).filter((item) => item?.id))
      setFeatures(extractList(featureResponse, 'features').map(normalizeFeature).filter((item) => item?.id))
      setTasks(extractList(taskResponse, 'tasks').map(normalizeTask).filter((item) => item?.id))
      setSubtasks(extractList(subtaskResponse, 'subtasks').map(normalizeSubTask).filter((item) => item?.id))
      setIssues(extractList(issueResponse, 'issues').map(normalizeIssue).filter((item) => item?.id))
      setUsers(extractList(userResponse, 'users').map(normalizeUser).filter((item) => item?.id))
    } catch (error) {
      toast.error('Failed to load reference data', getErrorMessage(error, 'Failed to load comment targets.'))
    }
  }, [])

  useEffect(() => {
    fetchReferences()
  }, [fetchReferences])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const summary = useMemo(() => ({
    total: pagination.total || comments.length,
    taskComments: comments.filter((comment) => comment.targetType === 'TASK').length,
    issueComments: comments.filter((comment) => comment.targetType === 'ISSUE').length,
  }), [comments, pagination.total])

  const handleSave = async (payload) => {
    try {
      setSaving(true)
      if (editor.mode === 'create') {
        await commentsService.create(withOrgId(payload))
        toast.success('Comment Created', 'The comment has been created.')
      } else {
        await commentsService.update(editor.comment.id, payload)
        toast.success('Comment Updated', 'The comment has been updated.')
      }
      setEditor(DEFAULT_EDITOR)
      await fetchComments()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to save comment.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await commentsService.delete(deleteTarget.id)
      toast.success('Comment Deleted', 'The comment has been deleted.')
      setDeleteTarget(null)
      await fetchComments()
    } catch (error) {
      toast.error('Delete Failed', getErrorMessage(error, 'Failed to delete comment.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <WorkspacePageHeader
        title="Comments"
        description="Manage comments across projects, features, tasks, subtasks, and issues from one place."
        actionLabel="New Comment"
        actionIcon="MessageSquare"
        onAction={() => setEditor({ open: true, mode: 'create', comment: null })}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Comments" value={summary.total} helper="Matching current filters" icon="MessageSquare" tone="blue" />
        <MetricCard label="Task Comments" value={summary.taskComments} helper="Visible task discussions" icon="CheckSquare" tone="amber" />
        <MetricCard label="Issue Comments" value={summary.issueComments} helper="Visible issue discussions" icon="Bug" tone="red" />
      </div>

      <FilterBar
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1) }}
        searchPlaceholder="Search comments..."
        loading={loading}
        onRefresh={fetchComments}
      >
        <SelectControl value={targetType} onChange={(value) => { setTargetType(value); setTargetId(''); setPage(1) }}>
          <option value="">All target types</option>
          <option value="PROJECT">Project</option>
          <option value="FEATURE">Feature</option>
          {WORK_TARGET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </SelectControl>
        <SelectControl value={targetId} onChange={(value) => { setTargetId(value); setPage(1) }}>
          <option value="">All targets</option>
          {targetOptions.map((target) => (
            <option key={target.id} value={target.id}>{target.name}</option>
          ))}
        </SelectControl>
        <SelectControl value={projectId} onChange={(value) => { setProjectId(value); setPage(1) }}>
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </SelectControl>
        <SelectControl value={createdById} onChange={(value) => { setCreatedById(value); setPage(1) }}>
          <option value="">All authors</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </SelectControl>
      </FilterBar>

      <TableShell title="Comment Register" subtitle="All workspace discussions with target and author context.">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="min-w-[320px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Comment</th>
              <th className="w-36 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Target Type</th>
              <th className="min-w-[220px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Target</th>
              <th className="min-w-[160px] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Author</th>
              <th className="w-32 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Created</th>
              <th className="w-28 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Loader2 size={24} className="mx-auto mb-2 animate-spin text-blue-600" />
                  <p className="text-sm text-ink-muted">Loading comments...</p>
                </td>
              </tr>
            ) : comments.length === 0 ? (
              <tr>
                <td colSpan={6}><EmptyState title="No comments found" description="Create a comment or adjust the filters." icon="MessageSquare" /></td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id} className="border-b border-surface-100 last:border-0 hover:bg-surface-100/40">
                  <td className="px-5 py-4">
                    <p className="line-clamp-3 whitespace-pre-wrap text-sm text-ink">{comment.body}</p>
                  </td>
                  <td className="px-5 py-4"><Badge className={priorityTone(comment.targetType)}>{comment.targetType}</Badge></td>
                  <td className="px-5 py-4 text-ink-muted">
                    <p className="font-semibold text-ink">{labels[comment.targetType]?.[comment.targetId] || comment.targetId || '-'}</p>
                    <p className="mt-1 text-xs text-ink-muted">{comment.targetId}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-muted">{comment.authorName}</td>
                  <td className="px-5 py-4 text-ink-muted">{formatDate(comment.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditor({ open: true, mode: 'edit', comment })}
                        className="rounded-lg p-2 text-ink-muted transition hover:bg-blue-50 hover:text-blue-600"
                        title="Edit comment"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(comment)}
                        className="rounded-lg p-2 text-ink-muted transition hover:bg-red-50 hover:text-red-600"
                        title="Delete comment"
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

      <CommentFormModal
        open={editor.open}
        mode={editor.mode}
        comment={editor.comment}
        saving={saving}
        refs={refs}
        onClose={() => !saving && setEditor(DEFAULT_EDITOR)}
        onSubmit={handleSave}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete comment?"
        description="This will remove the selected comment."
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
