import { useEffect, useMemo, useState } from 'react'
import { toast } from '../../../components/common/Toast'
import {
  cleanPayload,
  ISSUE_PRIORITY_OPTIONS,
  ISSUE_STATUS_OPTIONS,
  ISSUE_TYPE_OPTIONS,
  SEVERITY_OPTIONS,
  toInputDate,
  validateDates,
} from '../workspaceUtils'
import {
  FormActions,
  ModalShell,
  SelectControl,
  TextControl,
} from './WorkspacePrimitives'

const EMPTY_FORM = {
  title: '',
  description: '',
  type: 'ISSUE',
  status: 'OPEN',
  priority: 'MEDIUM',
  severity: 'MINOR',
  projectId: '',
  featureId: '',
  taskId: '',
  subTaskId: '',
  assignedToId: '',
  startDate: '',
  dueDate: '',
  budgetMinutes: 0,
  resolution: '',
}

export default function IssueFormModal({
  open,
  mode,
  issue,
  saving,
  projects = [],
  features = [],
  tasks = [],
  subtasks = [],
  users = [],
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    setForm({
      title: issue?.title || '',
      description: issue?.description || '',
      type: issue?.type || 'ISSUE',
      status: issue?.status || 'OPEN',
      priority: issue?.priority || 'MEDIUM',
      severity: issue?.severity || 'MINOR',
      projectId: issue?.projectId || '',
      featureId: issue?.featureId || '',
      taskId: issue?.taskId || '',
      subTaskId: issue?.subTaskId || '',
      assignedToId: issue?.assignedToId || '',
      startDate: toInputDate(issue?.startDate),
      dueDate: toInputDate(issue?.dueDate),
      budgetMinutes: Number(issue?.budgetMinutes || 0),
      resolution: issue?.resolution || '',
    })
  }, [issue, open])

  const availableFeatures = useMemo(() => {
    if (!form.projectId) return features
    return features.filter((feature) => String(feature.projectId) === String(form.projectId))
  }, [features, form.projectId])

  const availableTasks = useMemo(() => {
    if (!form.featureId) return tasks
    return tasks.filter((task) => String(task.featureId) === String(form.featureId))
  }, [form.featureId, tasks])

  const availableSubtasks = useMemo(() => {
    if (!form.taskId) return subtasks
    return subtasks.filter((subtask) => String(subtask.taskId) === String(form.taskId))
  }, [form.taskId, subtasks])

  const handleChange = (field, value) => {
    setForm((previous) => {
      const next = { ...previous, [field]: value }
      if (field === 'projectId') {
        next.featureId = ''
        next.taskId = ''
        next.subTaskId = ''
      }
      if (field === 'featureId') {
        next.taskId = ''
        next.subTaskId = ''
      }
      if (field === 'taskId') {
        next.subTaskId = ''
      }
      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      toast.warning('Validation Error', 'Issue title is required.')
      return
    }
    if (!form.projectId) {
      toast.warning('Validation Error', 'Select a project for this issue or bug.')
      return
    }
    if (!validateDates(form.startDate, form.dueDate)) {
      toast.warning('Validation Error', 'Due date cannot be before start date.')
      return
    }
    if (Number(form.budgetMinutes) < 0) {
      toast.warning('Validation Error', 'Budget minutes must be zero or positive.')
      return
    }

    onSubmit(cleanPayload({
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      status: form.status,
      priority: form.priority,
      severity: form.severity,
      projectId: form.projectId,
      featureId: form.featureId,
      taskId: form.taskId,
      subTaskId: form.subTaskId,
      assignedToId: form.assignedToId,
      startDate: form.startDate,
      dueDate: form.dueDate,
      budgetMinutes: Number(form.budgetMinutes || 0),
      resolution: form.resolution.trim(),
    }))
  }

  return (
    <ModalShell
      open={open}
      title={mode === 'create' ? 'Create Issue/Bug' : 'Edit Issue/Bug'}
      description="Track bugs and execution issues against the correct project hierarchy."
      icon="Bug"
      saving={saving}
      onClose={onClose}
      footer={<FormActions formId="issue-form" saving={saving} submitLabel={mode === 'create' ? 'Create issue' : 'Save changes'} onCancel={onClose} />}
    >
      <form id="issue-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <TextControl
            label="Title"
            required
            value={form.title}
            onChange={(value) => handleChange('title', value)}
            placeholder="Checklist save button does not respond"
          />
          <SelectControl label="Project" value={form.projectId} onChange={(value) => handleChange('projectId', value)}>
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </SelectControl>
        </div>

        <TextControl
          label="Description"
          value={form.description}
          onChange={(value) => handleChange('description', value)}
          rows={4}
          placeholder="Explain what is failing, expected behavior, and context."
        />

        <div className="grid gap-4 md:grid-cols-4">
          <SelectControl label="Type" value={form.type} onChange={(value) => handleChange('type', value)}>
            {ISSUE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectControl>
          <SelectControl label="Status" value={form.status} onChange={(value) => handleChange('status', value)}>
            {ISSUE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectControl>
          <SelectControl label="Priority" value={form.priority} onChange={(value) => handleChange('priority', value)}>
            {ISSUE_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectControl>
          <SelectControl label="Severity" value={form.severity} onChange={(value) => handleChange('severity', value)}>
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectControl>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <SelectControl label="Feature" value={form.featureId} onChange={(value) => handleChange('featureId', value)}>
            <option value="">No feature</option>
            {availableFeatures.map((feature) => (
              <option key={feature.id} value={feature.id}>{feature.name}</option>
            ))}
          </SelectControl>
          <SelectControl label="Task" value={form.taskId} onChange={(value) => handleChange('taskId', value)}>
            <option value="">No task</option>
            {availableTasks.map((task) => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </SelectControl>
          <SelectControl label="Subtask" value={form.subTaskId} onChange={(value) => handleChange('subTaskId', value)}>
            <option value="">No subtask</option>
            {availableSubtasks.map((subtask) => (
              <option key={subtask.id} value={subtask.id}>{subtask.title}</option>
            ))}
          </SelectControl>
          <SelectControl label="Assignee" value={form.assignedToId} onChange={(value) => handleChange('assignedToId', value)}>
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </SelectControl>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <TextControl type="date" label="Start Date" value={form.startDate} onChange={(value) => handleChange('startDate', value)} />
          <TextControl type="date" label="Due Date" value={form.dueDate} onChange={(value) => handleChange('dueDate', value)} />
          <TextControl type="number" min="0" label="Budget Minutes" value={form.budgetMinutes} onChange={(value) => handleChange('budgetMinutes', value)} />
        </div>

        <TextControl
          label="Resolution"
          value={form.resolution}
          onChange={(value) => handleChange('resolution', value)}
          rows={3}
          placeholder="Add fix summary or closure notes when available."
        />
      </form>
    </ModalShell>
  )
}
