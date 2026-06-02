import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Edit3, Loader2 } from 'lucide-react'
import { toast } from '../../components/common/Toast'
import projectsService from '../../apis/services/projects/projects.service'
import departmentService from '../../apis/services/departments/department.service'
import teamService from '../../apis/services/departments/team.service'
import userService from '../../apis/services/users/user.service'
import ProjectFormModal from './components/ProjectFormModal'
import CommentsPanel from '../workspace/components/CommentsPanel'
import PermissionGuard from '../../components/common/PermissionGuard'

const getEntityId = (entity) => {
  if (!entity) return ''
  const keys = ['id', 'projectId', '_id', 'uuid']
  const value = keys.map((key) => entity?.[key]).find((candidate) => candidate !== undefined && candidate !== null)
  return value !== undefined && value !== null ? String(value) : ''
}

const normalizeProject = (project) => {
  if (!project || typeof project !== 'object') return null
  return {
    id: getEntityId(project),
    name: project?.name || project?.projectName || 'Untitled Project',
    description: project?.description || project?.details || '',
    status: project?.status || 'PLANNING',
    startDate: project?.startDate || project?.start_date || '',
    endDate: project?.endDate || project?.end_date || '',
    budgetMinutes: Number(project?.budgetMinutes || 0),
    departmentId: project?.departmentId || project?.department_id || '',
    teamIds: Array.isArray(project?.teamIds) ? project.teamIds : project?.teamIds || [],
    memberIds: Array.isArray(project?.memberIds) ? project.memberIds : project?.memberIds || [],
    orgId: project?.orgId || project?.orgID || '',
    raw: project,
  }
}

const getErrorMessage = (error, fallback) => {
  const message = error?.response?.data?.message || error?.response?.data?.error || error?.message
  return Array.isArray(message) ? message.join(', ') : message || fallback
}

const formatDate = (value) => {
  if (!value) return 'Not set'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not set'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatMinutes = (value) => {
  const minutes = Number(value) || 0
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (hours > 0 && remaining > 0) return `${hours}h ${remaining}m`
  if (hours > 0) return `${hours}h`
  return `${remaining}m`
}

export default function ProjectDetails() {
  // Read project id from query string: support both `projectId` and legacy typo `projecId`
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('projectId') || searchParams.get('projecId') || ''
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [departments, setDepartments] = useState([])
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])

  const fetchProject = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await projectsService.getById(id)
      const entity = normalizeProject(response?.project || response?.data || response)
      setProject(entity)
    } catch (error) {
      toast.error('Failed to load project', getErrorMessage(error, 'Failed to load project details.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  useEffect(() => {
    const getEntityIdGeneric = (entity, fallbackKey) => {
      if (!entity) return ''
      const keys = [fallbackKey, 'id', 'departmentId', 'teamId', 'userId', '_id', 'uuid'].filter(Boolean)
      const value = keys.map((key) => entity?.[key]).find((candidate) => candidate !== undefined && candidate !== null)
      return value !== undefined && value !== null ? String(value) : ''
    }

    const normalizeDepartment = (department) => ({
      id: getEntityIdGeneric(department, 'departmentId'),
      name: department?.name || department?.departmentName || 'Untitled Department',
      raw: department,
    })

    const resolveTeamDepartmentId = (team) => {
      const direct = team?.departmentId || team?.department_id
      if (direct !== undefined && direct !== null) return String(direct)
      const nested = team?.department || team?.departmentObject
      return getEntityIdGeneric(nested, 'departmentId')
    }

    const normalizeTeam = (team) => ({
      id: getEntityIdGeneric(team, 'teamId'),
      departmentId: resolveTeamDepartmentId(team),
      name: team?.name || team?.teamName || 'Untitled Team',
      raw: team,
    })

    const normalizeUser = (user) => {
      const firstName = user?.firstName || user?.first_name || ''
      const lastName = user?.lastName || user?.last_name || ''
      const fullName = `${firstName} ${lastName}`.trim() || user?.name || user?.email || 'Untitled User'
      return {
        id: getEntityIdGeneric(user, 'userId'),
        name: fullName,
        email: user?.email || '',
        raw: user,
      }
    }

    const extractList = (response, resourceKey) => {
      if (Array.isArray(response)) return response

      const candidates = [
        response?.[resourceKey],
        response?.data,
        response?.projects,
        response?.items,
        response?.results,
        response?.rows,
        response?.data?.[resourceKey],
        response?.data?.items,
        response?.data?.results,
        response?.data?.rows,
      ]

      return candidates.find(Array.isArray) || []
    }

    const fetchReferenceData = async () => {
      try {
        const [departmentsResponse, teamsResponse, usersResponse] = await Promise.all([
          departmentService.list({ page: 1, limit: 200 }),
          teamService.list({ page: 1, limit: 200 }),
          userService.list({ page: 1, limit: 200 }),
        ])

        const rawDepartments = extractList(departmentsResponse, 'departments')
        const rawTeams = extractList(teamsResponse, 'teams')
        const rawUsers = extractList(usersResponse, 'users')

        setDepartments(rawDepartments.map(normalizeDepartment).filter((d) => d.id))
        setTeams(rawTeams.map(normalizeTeam).filter((t) => t.id))
        setUsers(rawUsers.map(normalizeUser).filter((u) => u.id))
      } catch (error) {
        toast.error('Failed to load reference data', getErrorMessage(error, 'Failed to load departments, teams, or users.'))
      }
    }

    fetchReferenceData()
  }, [])

  const closeEditor = () => {
    if (!saving) setEditing(false)
  }

  const handleSave = async (payload) => {
    if (!project?.id) return
    setSaving(true)
    try {
      await projectsService.update(project.id, payload)
      toast.success('Project Updated', `"${payload.name}" has been updated.`)
      setEditing(false)
      await fetchProject()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to update project.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-card">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-card">
        <p className="text-sm text-ink-muted">Project could not be found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/workspace/projects')}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-3 py-2 text-sm text-ink-muted transition hover:bg-surface-100"
          >
            <ArrowLeft size={14} />
            Back to projects
          </button>
          <h2 className="text-2xl font-semibold text-ink">{project.name}</h2>
          <p className="mt-1 text-sm text-ink-muted">Review the project details and update as needed.</p>
        </div>
        <PermissionGuard permission="project details.UPDATE">
          <button
            type="button"
            onClick={async () => {
              // Ensure reference lists are loaded before opening the edit modal
              if (departments.length === 0 || teams.length === 0 || users.length === 0) {
                try {
                  const [departmentsResponse, teamsResponse, usersResponse] = await Promise.all([
                    departmentService.list({ page: 1, limit: 200 }),
                    teamService.list({ page: 1, limit: 200 }),
                    userService.list({ page: 1, limit: 200 }),
                  ])

                  const rawDepartments = Array.isArray(departmentsResponse?.departments)
                    ? departmentsResponse.departments
                    : Array.isArray(departmentsResponse?.data)
                    ? departmentsResponse.data
                    : Array.isArray(departmentsResponse)
                    ? departmentsResponse
                    : []

                  const rawTeams = Array.isArray(teamsResponse?.teams)
                    ? teamsResponse.teams
                    : Array.isArray(teamsResponse?.data)
                    ? teamsResponse.data
                    : Array.isArray(teamsResponse)
                    ? teamsResponse
                    : []

                  const rawUsers = Array.isArray(usersResponse?.users)
                    ? usersResponse.users
                    : Array.isArray(usersResponse?.data)
                    ? usersResponse.data
                    : Array.isArray(usersResponse)
                    ? usersResponse
                    : []

                  const getEntityIdGeneric = (entity, fallbackKey) => {
                    if (!entity) return ''
                    const keys = [fallbackKey, 'id', 'departmentId', 'teamId', 'userId', '_id', 'uuid'].filter(Boolean)
                    const value = keys.map((key) => entity?.[key]).find((candidate) => candidate !== undefined && candidate !== null)
                    return value !== undefined && value !== null ? String(value) : ''
                  }

                  const normalizeDepartment = (department) => ({
                    id: getEntityIdGeneric(department, 'departmentId'),
                    name: department?.name || department?.departmentName || 'Untitled Department',
                    raw: department,
                  })

                  const resolveTeamDepartmentId = (team) => {
                    const direct = team?.departmentId || team?.department_id
                    if (direct !== undefined && direct !== null) return String(direct)
                    const nested = team?.department || team?.departmentObject
                    return getEntityIdGeneric(nested, 'departmentId')
                  }

                  const normalizeTeam = (team) => ({
                    id: getEntityIdGeneric(team, 'teamId'),
                    departmentId: resolveTeamDepartmentId(team),
                    name: team?.name || team?.teamName || 'Untitled Team',
                    raw: team,
                  })

                  const normalizeUser = (user) => {
                    const firstName = user?.firstName || user?.first_name || ''
                    const lastName = user?.lastName || user?.last_name || ''
                    const fullName = `${firstName} ${lastName}`.trim() || user?.name || user?.email || 'Untitled User'
                    return {
                      id: getEntityIdGeneric(user, 'userId'),
                      name: fullName,
                      email: user?.email || '',
                      raw: user,
                    }
                  }

                  setDepartments(rawDepartments.map(normalizeDepartment).filter((d) => d.id))
                  setTeams(rawTeams.map(normalizeTeam).filter((t) => t.id))
                  setUsers(rawUsers.map(normalizeUser).filter((u) => u.id))
                } catch (error) {
                  toast.error('Failed to load reference data', getErrorMessage(error, 'Failed to load departments, teams, or users.'))
                }
              }

              setEditing(true)
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:shadow-lg"
          >
            <Edit3 size={16} />
            Edit project
          </button>
        </PermissionGuard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Status</p>
          <div className="mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700 bg-blue-50">
            {project.status}
          </div>

          <div className="mt-6 space-y-4 text-sm text-ink-muted">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-muted">Start date</p>
              <p className="mt-1 text-ink">{formatDate(project.startDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-muted">End date</p>
              <p className="mt-1 text-ink">{formatDate(project.endDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-muted">Department</p>
              <p className="mt-1 text-ink">{project.raw?.department?.name || (departments.find((d) => d.id === project.departmentId)?.name) || project.departmentId || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-muted">Budget</p>
              <p className="mt-1 text-ink">{formatMinutes(project.budgetMinutes)}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-surface-200 bg-white p-6 shadow-card">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-muted">Teams</p>
              <p className="mt-1 text-ink">
                {project.raw?.teams?.length > 0
                  ? project.raw.teams.map((t) => t.name || t.teamName || t.id).join(', ')
                  : teams && project.teamIds.length > 0
                  ? project.teamIds.map((id) => (teams.find((t) => t.id === id) || { name: id }).name).join(', ')
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-muted">Start / End</p>
              <p className="mt-1 text-ink">{formatDate(project.startDate)} — {formatDate(project.endDate)}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-ink-muted">Members</p>
            <p className="mt-1 text-ink">
              {project.raw?.members?.length > 0
                ? project.raw.members.map((m) => `${m.firstName || m.first_name || ''} ${m.lastName || m.last_name || ''}`.trim() || m.name || m.email || m.id).join(', ')
                : users && project.memberIds.length > 0
                ? project.memberIds.map((id) => (users.find((u) => u.id === id) || { name: id }).name).join(', ')
                : 'Not set'}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-surface-200 bg-surface-50 p-5">
            <p className="text-xs uppercase tracking-wider text-ink-muted">Description</p>
            <p className="mt-3 text-ink">{project.description || 'No description provided.'}</p>
          </div>
        </div>
      </div>

      <ProjectFormModal
        open={editing}
        mode="edit"
        project={project}
        saving={saving}
        onClose={closeEditor}
        onSubmit={handleSave}
        departments={departments}
        teams={teams}
        users={users}
      />

      <CommentsPanel
        targetType="PROJECT"
        targetId={project.id}
        title="Project Comments"
      />
    </div>
  )
}
