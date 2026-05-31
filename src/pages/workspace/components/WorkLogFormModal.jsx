import { useEffect, useMemo, useState } from 'react'
import { toast } from '../../../components/common/Toast'
import {
  cleanPayload,
  getStoredUserId,
  toInputDate,
  WORK_TARGET_OPTIONS,
} from '../workspaceUtils'
import {
  FormActions,
  ModalShell,
  SelectControl,
  TextControl,
} from './WorkspacePrimitives'

const today = () => new Date().toISOString().slice(0, 10)

const EMPTY_FORM = {
  targetType: 'TASK',
  targetId: '',
  logDate: today(),
  minutesSpent: 30,
  description: '',
  userId: '',
}

export default function WorkLogFormModal({
  open,
  mode,
  workLog,
  saving,
  tasks = [],
  subtasks = [],
  issues = [],
  users = [],
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    setForm({
      targetType: workLog?.targetType || 'TASK',
      targetId: workLog?.targetId || '',
      logDate: toInputDate(workLog?.logDate) || today(),
      minutesSpent: Number(workLog?.minutesSpent || 30),
      description: workLog?.description || '',
      userId: workLog?.userId || getStoredUserId(),
    })
  }, [open, workLog])

  const targets = useMemo(() => {
    if (form.targetType === 'SUB_TASK') return subtasks.map((subtask) => ({ id: subtask.id, name: subtask.title }))
    if (form.targetType === 'ISSUE') return issues.map((issue) => ({ id: issue.id, name: issue.title }))
    return tasks.map((task) => ({ id: task.id, name: task.title }))
  }, [form.targetType, issues, subtasks, tasks])

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
      ...(field === 'targetType' ? { targetId: '' } : null),
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.targetId) {
      toast.warning('Validation Error', 'Select the work item for this log.')
      return
    }
    if (!form.logDate) {
      toast.warning('Validation Error', 'Log date is required.')
      return
    }
    if (Number(form.minutesSpent) <= 0) {
      toast.warning('Validation Error', 'Minutes spent must be greater than zero.')
      return
    }

    onSubmit(cleanPayload({
      targetType: form.targetType,
      targetId: form.targetId,
      logDate: form.logDate,
      minutesSpent: Number(form.minutesSpent),
      description: form.description.trim(),
      userId: form.userId,
    }))
  }

  return (
    <ModalShell
      open={open}
      title={mode === 'create' ? 'Log Work' : 'Edit Work Log'}
      description="Record actual time against tasks, subtasks, or issues."
      icon="Timer"
      saving={saving}
      onClose={onClose}
      footer={<FormActions formId="work-log-form" saving={saving} submitLabel={mode === 'create' ? 'Create log' : 'Save changes'} onCancel={onClose} />}
    >
      <form id="work-log-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <SelectControl label="Target Type" value={form.targetType} onChange={(value) => handleChange('targetType', value)}>
            {WORK_TARGET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectControl>
          <SelectControl label="Work Item" value={form.targetId} onChange={(value) => handleChange('targetId', value)}>
            <option value="">Select work item</option>
            {targets.map((target) => (
              <option key={target.id} value={target.id}>{target.name}</option>
            ))}
          </SelectControl>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <TextControl type="date" label="Log Date" value={form.logDate} onChange={(value) => handleChange('logDate', value)} />
          <TextControl type="number" min="1" label="Minutes Spent" value={form.minutesSpent} onChange={(value) => handleChange('minutesSpent', value)} />
          <SelectControl label="User" value={form.userId} onChange={(value) => handleChange('userId', value)}>
            <option value="">Current user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </SelectControl>
        </div>

        <TextControl
          label="Description"
          value={form.description}
          onChange={(value) => handleChange('description', value)}
          rows={4}
          placeholder="What was done during this time?"
        />
      </form>
    </ModalShell>
  )
}
