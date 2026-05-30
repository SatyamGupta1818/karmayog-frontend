/**
 * Projects Index Page
 * /projects
 *
 * Parent route for Projects. Renders the project list and CRUD UI.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from '../../components/common/Toast'
import projectsService from '../../apis/services/projects/projects.service'
import departmentService from '../../apis/services/departments/department.service'
import teamService from '../../apis/services/departments/team.service'
import userService from '../../apis/services/users/user.service'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import ProjectFormModal from './components/ProjectFormModal'
import ProjectTable from './components/ProjectTable'
import ProjectToolbar from './components/ProjectToolbar'

const DEFAULT_EDITOR = {
  open: false,
  mode: 'create',
  project: null,
}

const getEntityId = (entity) => {
  if (!entity) return ''
  const keys = ['id', 'projectId', '_id', 'uuid']
  const value = keys.map((key) => entity?.[key]).find((candidate) => candidate !== undefined && candidate !== null)
  return value !== undefined && value !== null ? String(value) : ''
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

const normalizeProject = (project) => {
  if (!project || typeof project !== 'object') return null
  return {
    id: getEntityId(project),
    name: project?.name || project?.projectName || 'Untitled Project',
    description: project?.description || project?.details || '',
    status: project?.status || 'PLANNING',
    raw: project,
  }
}

// --- Reference data helpers (normalize departments/teams/users) ---
const getEntityIdGeneric = (entity, fallbackKey) => {
  if (!entity) return ''
  const keys = [fallbackKey, 'id', 'departmentId', 'teamId', 'userId', '_id', 'uuid'].filter(Boolean)
  const value = keys.map((key) => entity?.[key]).find((candidate) => candidate !== undefined && candidate !== null)
  return value !== undefined && value !== null ? String(value) : ''
}

const normalizeDepartment = (department) => ({
  id: getEntityIdGeneric(department, 'departmentId'),
  name: department?.name || department?.departmentName || department?.department || 'Untitled Department',
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

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editor, setEditor] = useState(DEFAULT_EDITOR)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [departments, setDepartments] = useState([])
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const navigate = useNavigate()

  const getErrorMessage = (error, fallback) => {
    const message = error?.response?.data?.message || error?.response?.data?.error || error?.message
    return Array.isArray(message) ? message.join(', ') : message || fallback
  }

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      }

      if (search.trim()) params.search = search.trim()
      if (status) params.status = status

      const response = await projectsService.list(params)
      const rawItems = extractList(response, 'projects')
      const normalized = rawItems
        .map(normalizeProject)
        .filter((item) => item && item.id)

      setProjects(normalized)
    } catch (error) {
      toast.error('Failed to load projects', getErrorMessage(error, 'Failed to load projects.'))
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [search, status])

  const fetchReferenceData = useCallback(async () => {
    try {
      const [departmentsResponse, teamsResponse, usersResponse] = await Promise.all([
        departmentService.list({ page: 1, limit: 200 }),
        teamService.list({ page: 1, limit: 200 }),
        userService.list({ page: 1, limit: 200 }),
      ])

      const rawDepartments = extractList(departmentsResponse, 'departments')
      const rawTeams = extractList(teamsResponse, 'teams')
      const rawUsers = extractList(usersResponse, 'users')

      const departmentList = rawDepartments.map(normalizeDepartment).filter((d) => d.id)
      const teamList = rawTeams.map(normalizeTeam).filter((t) => t.id)
      const userList = rawUsers.map(normalizeUser).filter((u) => u.id)

      setDepartments(departmentList)
      setTeams(teamList)
      setUsers(userList)
    } catch (error) {
      toast.error('Failed to load reference data', getErrorMessage(error, 'Failed to load departments, teams, or users.'))
    }
  }, [])

  useEffect(() => {
    fetchProjects()
    fetchReferenceData()
  }, [fetchProjects, fetchReferenceData])

  const openCreate = async () => {
    // Ensure reference lists are loaded before opening the create modal
    if (departments.length === 0 || teams.length === 0 || users.length === 0) {
      try {
        await fetchReferenceData()
      } catch (e) {
        // fetchReferenceData already shows toast on error
      }
    }
    setEditor({ open: true, mode: 'create', project: null })
  }

  const viewProject = (project) => {
    const id = getEntityId(project)
    if (id) {
      // Navigate to stable details path with projectId as query param
      navigate(`/workspace/projects/details?projectId=${id}`)
    }
  }

  const closeEditor = () => {
    if (!saving) setEditor(DEFAULT_EDITOR)
  }

  const handleSave = async (payload) => {
    setSaving(true)
    try {
      if (editor.mode === 'create') {
        await projectsService.create(payload)
        toast.success('Project Created', `"${payload.name}" has been created.`)
      } else {
        await projectsService.update(editor.project.id, payload)
        toast.success('Project Updated', `"${payload.name}" has been updated.`)
      }

      setEditor(DEFAULT_EDITOR)
      await fetchProjects()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to save project.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      await projectsService.delete(deleteTarget.id)
      toast.success('Project Deleted', `"${deleteTarget.name}" has been deleted.`)
      setDeleteTarget(null)
      await fetchProjects()
    } catch (error) {
      toast.error('Delete Failed', getErrorMessage(error, 'Failed to delete project.'))
    } finally {
      setDeleting(false)
    }
  }

  const visibleProjects = useMemo(() => {
    if (!search.trim()) return projects
    const query = search.trim().toLowerCase()
    return projects.filter((project) => (
      project.name?.toLowerCase().includes(query)
      || project.description?.toLowerCase().includes(query)
      || project.status?.toLowerCase().includes(query)
    ))
  }, [projects, search])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Projects</h2>
          <p className="mt-1 text-sm text-ink-muted">Create, update, and manage your project portfolio.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      <ProjectToolbar
        search={search}
        status={status}
        loading={loading}
        onSearchChange={setSearch}
        onFilterChange={(field, value) => {
          if (field === 'status') setStatus(value)
        }}
        onRefresh={fetchProjects}
      />

      <ProjectTable
        projects={visibleProjects}
        loading={loading}
        deletingId={deleteTarget?.id}
        onView={viewProject}
        onDelete={setDeleteTarget}
      />

      <ProjectFormModal
        open={editor.open}
        mode={editor.mode}
        project={editor.project}
        saving={saving}
        onClose={closeEditor}
        onSubmit={handleSave}
        departments={departments}
        teams={teams}
        users={users}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        project={deleteTarget}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
