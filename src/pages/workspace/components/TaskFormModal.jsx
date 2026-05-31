import { useEffect, useState } from 'react'
import { toast } from '../../../components/common/Toast'
import {
  cleanPayload,
  PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
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
  status: 'TODO',
  priority: 'MEDIUM',
  featureId: '',
  assignedToId: '',
  startDate: '',
  dueDate: '',
  budgetMinutes: 0,
}

export default function TaskFormModal({
  open,
  mode,
  task,
  saving,
  features = [],
  users = [],
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    setForm({
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'TODO',
      priority: task?.priority || 'MEDIUM',
      featureId: task?.featureId || '',
      assignedToId: task?.assignedToId || '',
      startDate: toInputDate(task?.startDate),
      dueDate: toInputDate(task?.dueDate),
      budgetMinutes: Number(task?.budgetMinutes || 0),
    })
  }, [open, task])

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      toast.warning('Validation Error', 'Task title is required.')
      return
    }
    if (!form.featureId) {
      toast.warning('Validation Error', 'Select a feature for this task.')
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
      status: form.status,
      priority: form.priority,
      featureId: form.featureId,
      assignedToId: form.assignedToId,
      startDate: form.startDate,
      dueDate: form.dueDate,
      budgetMinutes: Number(form.budgetMinutes || 0),
    }))
  }

  return (
    <ModalShell
      open={open}
      title={mode === 'create' ? 'Create Task' : 'Edit Task'}
      description="Plan assignable work under a feature with dates, priority, and budget."
      icon="CheckSquare"
      saving={saving}
      onClose={onClose}
      footer={<FormActions formId="task-form" saving={saving} submitLabel={mode === 'create' ? 'Create task' : 'Save changes'} onCancel={onClose} />}
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <TextControl
            label="Task Title"
            required
            value={form.title}
            onChange={(value) => handleChange('title', value)}
            placeholder="Create onboarding checklist API"
          />
          <SelectControl label="Feature" value={form.featureId} onChange={(value) => handleChange('featureId', value)}>
            <option value="">Select feature</option>
            {features.map((feature) => (
              <option key={feature.id} value={feature.id}>
                {feature.name}{feature.projectName ? ` - ${feature.projectName}` : ''}
              </option>
            ))}
          </SelectControl>
        </div>

        <TextControl
          label="Description"
          value={form.description}
          onChange={(value) => handleChange('description', value)}
          rows={4}
          placeholder="Describe the work and acceptance notes."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <SelectControl label="Status" value={form.status} onChange={(value) => handleChange('status', value)}>
            {TASK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectControl>
          <SelectControl label="Priority" value={form.priority} onChange={(value) => handleChange('priority', value)}>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
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
          <TextControl
            type="number"
            min="0"
            label="Budget Minutes"
            value={form.budgetMinutes}
            onChange={(value) => handleChange('budgetMinutes', value)}
          />
        </div>
      </form>
    </ModalShell>
  )
}
