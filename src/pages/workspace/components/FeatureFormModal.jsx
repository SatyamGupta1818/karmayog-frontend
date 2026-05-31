import { useEffect, useState } from 'react'
import { toast } from '../../../components/common/Toast'
import {
  cleanPayload,
  FEATURE_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
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
  name: '',
  description: '',
  status: 'PLANNED',
  priority: 'MEDIUM',
  projectId: '',
  ownerId: '',
  startDate: '',
  dueDate: '',
  budgetMinutes: 0,
}

export default function FeatureFormModal({
  open,
  mode,
  feature,
  saving,
  projects = [],
  users = [],
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    setForm({
      name: feature?.name || '',
      description: feature?.description || '',
      status: feature?.status || 'PLANNED',
      priority: feature?.priority || 'MEDIUM',
      projectId: feature?.projectId || '',
      ownerId: feature?.ownerId || '',
      startDate: toInputDate(feature?.startDate),
      dueDate: toInputDate(feature?.dueDate),
      budgetMinutes: Number(feature?.budgetMinutes || 0),
    })
  }, [feature, open])

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim()) {
      toast.warning('Validation Error', 'Feature name is required.')
      return
    }
    if (!form.projectId) {
      toast.warning('Validation Error', 'Select a project for this feature.')
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
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      projectId: form.projectId,
      ownerId: form.ownerId,
      startDate: form.startDate,
      dueDate: form.dueDate,
      budgetMinutes: Number(form.budgetMinutes || 0),
    }))
  }

  return (
    <ModalShell
      open={open}
      title={mode === 'create' ? 'Create Feature' : 'Edit Feature'}
      description="Group execution work under a project with ownership, priority, dates, and budget."
      icon="Flag"
      saving={saving}
      onClose={onClose}
      footer={<FormActions formId="feature-form" saving={saving} submitLabel={mode === 'create' ? 'Create feature' : 'Save changes'} onCancel={onClose} />}
    >
      <form id="feature-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <TextControl
            label="Feature Name"
            required
            value={form.name}
            onChange={(value) => handleChange('name', value)}
            placeholder="Client onboarding flow"
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
          placeholder="Describe the outcome and scope."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <SelectControl label="Status" value={form.status} onChange={(value) => handleChange('status', value)}>
            {FEATURE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectControl>
          <SelectControl label="Priority" value={form.priority} onChange={(value) => handleChange('priority', value)}>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectControl>
          <SelectControl label="Owner" value={form.ownerId} onChange={(value) => handleChange('ownerId', value)}>
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
