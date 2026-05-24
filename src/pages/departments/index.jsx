import { useCallback, useEffect, useMemo, useState } from 'react'
import { Filter, Plus, RefreshCw, Search } from 'lucide-react'
import departmentService from '../../apis/services/departments/department.service'
import teamService from '../../apis/services/departments/team.service'
import PermissionGuard from '../../components/common/PermissionGuard'
import { toast } from '../../components/common/Toast'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import DepartmentFormModal from './components/DepartmentFormModal'
import DepartmentList from './components/DepartmentList'
import DepartmentSummary from './components/DepartmentSummary'
import TeamFormModal from './components/TeamFormModal'
import TeamsPanel from './components/TeamsPanel'

const DEFAULT_DEPARTMENT_EDITOR = {
  open: false,
  mode: 'create',
  item: null,
}

const DEFAULT_TEAM_EDITOR = {
  open: false,
  mode: 'create',
  item: null,
}

const getEntityId = (entity, fallbackKey) => {
  if (!entity) return ''
  const keys = [fallbackKey, 'id', '_id', 'uuid'].filter(Boolean)
  const value = keys.map((key) => entity[key]).find((candidate) => candidate !== undefined && candidate !== null)
  return value !== undefined && value !== null ? String(value) : ''
}

const normalizeActive = (isActive, status) => {
  if (typeof isActive === 'boolean') return isActive
  if (typeof isActive === 'string') return isActive.toLowerCase() !== 'false'
  if (typeof status === 'string') return status.toLowerCase() !== 'inactive'
  return true
}

const extractList = (response, resourceKey) => {
  if (Array.isArray(response)) return response

  const candidates = [
    response?.[resourceKey],
    response?.data,
    response?.items,
    response?.results,
    response?.rows,
    response?.data?.[resourceKey],
    response?.data?.data,
    response?.data?.items,
    response?.data?.results,
    response?.data?.rows,
  ]

  return candidates.find(Array.isArray) || []
}

const extractEntity = (response, resourceKey) => {
  const candidates = [
    response?.[resourceKey],
    response?.data?.[resourceKey],
    response?.data?.data,
    response?.data,
    response,
  ]

  return candidates.find((candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate)) || null
}

const normalizeDepartment = (department) => ({
  id: getEntityId(department, 'departmentId'),
  name: department?.name || department?.departmentName || 'Untitled Department',
  description: department?.description || '',
  isActive: normalizeActive(department?.isActive, department?.status),
  raw: department,
})

const resolveTeamDepartmentId = (team) => {
  const direct = team?.departmentId || team?.department_id
  if (direct !== undefined && direct !== null) return String(direct)
  return getEntityId(team?.department, 'departmentId')
}

const normalizeTeam = (team, fallbackDepartmentId = '') => ({
  id: getEntityId(team, 'teamId'),
  departmentId: resolveTeamDepartmentId(team) || fallbackDepartmentId,
  departmentName: team?.department?.name || team?.departmentName || '',
  name: team?.name || team?.teamName || 'Untitled Team',
  description: team?.description || '',
  isActive: normalizeActive(team?.isActive, team?.status),
  raw: team,
})

const getErrorMessage = (error, fallback) => {
  const message = error?.response?.data?.message || error?.response?.data?.error || error?.message
  return Array.isArray(message) ? message.join(', ') : message || fallback
}

const cleanPayload = (payload) => ({
  name: payload.name,
  description: payload.description || undefined,
  isActive: payload.isActive,
})

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [teams, setTeams] = useState([])
  const [allTeams, setAllTeams] = useState([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null)

  const [departmentSearch, setDepartmentSearch] = useState('')
  const [teamSearch, setTeamSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [departmentLoading, setDepartmentLoading] = useState(true)
  const [teamsLoading, setTeamsLoading] = useState(false)
  const [savingDepartment, setSavingDepartment] = useState(false)
  const [savingTeam, setSavingTeam] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updatingDepartmentId, setUpdatingDepartmentId] = useState(null)
  const [updatingTeamId, setUpdatingTeamId] = useState(null)

  const [departmentEditor, setDepartmentEditor] = useState(DEFAULT_DEPARTMENT_EDITOR)
  const [teamEditor, setTeamEditor] = useState(DEFAULT_TEAM_EDITOR)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchDepartments = useCallback(async () => {
    try {
      setDepartmentLoading(true)
      const response = await departmentService.list({
        page: 1,
        limit: 100,
        sortBy: 'name',
        sortOrder: 'ASC',
      })
      const normalized = extractList(response, 'departments')
        .map(normalizeDepartment)
        .filter((department) => department.id)

      setDepartments(normalized)
      setSelectedDepartmentId((previous) => {
        if (previous && normalized.some((department) => department.id === previous)) return previous
        return normalized[0]?.id || null
      })
    } catch (error) {
      toast.error('Failed to load departments', getErrorMessage(error, 'Failed to load departments.'))
      setDepartments([])
      setSelectedDepartmentId(null)
    } finally {
      setDepartmentLoading(false)
    }
  }, [])

  const fetchTeamOverview = useCallback(async () => {
    try {
      const response = await teamService.list({
        page: 1,
        limit: 500,
        sortBy: 'name',
        sortOrder: 'ASC',
      })
      const normalized = extractList(response, 'teams')
        .map((team) => normalizeTeam(team))
        .filter((team) => team.id)

      setAllTeams(normalized)
    } catch (error) {
      toast.error('Failed to load teams', getErrorMessage(error, 'Failed to load teams.'))
      setAllTeams([])
    }
  }, [])

  const fetchDepartmentTeams = useCallback(async (departmentId) => {
    if (!departmentId) {
      setTeams([])
      return
    }

    try {
      setTeamsLoading(true)
      const response = await teamService.list({
        page: 1,
        limit: 200,
        departmentId,
        sortBy: 'name',
        sortOrder: 'ASC',
      })
      const normalized = extractList(response, 'teams')
        .map((team) => normalizeTeam(team))
        .filter((team) => team.id)

      const hasDepartmentIds = normalized.some((team) => team.departmentId)
      const scopedTeams = hasDepartmentIds
        ? normalized.filter((team) => team.departmentId === departmentId)
        : normalized.map((team) => ({ ...team, departmentId }))

      setTeams(scopedTeams)
    } catch (error) {
      toast.error('Failed to load teams', getErrorMessage(error, 'Failed to load teams for this department.'))
      setTeams([])
    } finally {
      setTeamsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
    fetchTeamOverview()
  }, [fetchDepartments, fetchTeamOverview])

  useEffect(() => {
    setTeamSearch('')
    fetchDepartmentTeams(selectedDepartmentId)
  }, [fetchDepartmentTeams, selectedDepartmentId])

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.id === selectedDepartmentId) || null,
    [departments, selectedDepartmentId]
  )

  const teamCounts = useMemo(() => {
    return allTeams.reduce((counts, team) => {
      if (!team.departmentId) return counts
      counts[team.departmentId] = (counts[team.departmentId] || 0) + 1
      return counts
    }, {})
  }, [allTeams])

  const filteredDepartments = useMemo(() => {
    const query = departmentSearch.trim().toLowerCase()
    return departments.filter((department) => {
      const matchesSearch = !query
        || department.name.toLowerCase().includes(query)
        || department.description.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'active' && department.isActive)
        || (statusFilter === 'inactive' && !department.isActive)

      return matchesSearch && matchesStatus
    })
  }, [departmentSearch, departments, statusFilter])

  const filteredTeams = useMemo(() => {
    const query = teamSearch.trim().toLowerCase()
    if (!query) return teams

    return teams.filter((team) => (
      team.name.toLowerCase().includes(query)
      || team.description.toLowerCase().includes(query)
    ))
  }, [teamSearch, teams])

  const activeDepartmentCount = useMemo(
    () => departments.filter((department) => department.isActive).length,
    [departments]
  )

  const openCreateDepartment = () => {
    setDepartmentEditor({ open: true, mode: 'create', item: null })
  }

  const openEditDepartment = (department) => {
    setDepartmentEditor({ open: true, mode: 'edit', item: department })
  }

  const closeDepartmentEditor = () => {
    if (!savingDepartment) setDepartmentEditor(DEFAULT_DEPARTMENT_EDITOR)
  }

  const openCreateTeam = () => {
    setTeamEditor({ open: true, mode: 'create', item: null })
  }

  const openEditTeam = (team) => {
    setTeamEditor({ open: true, mode: 'edit', item: team })
  }

  const closeTeamEditor = () => {
    if (!savingTeam) setTeamEditor(DEFAULT_TEAM_EDITOR)
  }

  const refreshCurrentData = async () => {
    await Promise.all([
      fetchDepartments(),
      fetchTeamOverview(),
      selectedDepartmentId ? fetchDepartmentTeams(selectedDepartmentId) : Promise.resolve(),
    ])
  }

  const handleSaveDepartment = async (payload) => {
    setSavingDepartment(true)
    try {
      const nextPayload = cleanPayload(payload)

      if (departmentEditor.mode === 'create') {
        const response = await departmentService.create(nextPayload)
        const created = extractEntity(response, 'department')
        const createdId = getEntityId(created, 'departmentId')
        if (createdId) setSelectedDepartmentId(createdId)
        toast.success('Department Created', `"${payload.name}" has been created.`)
      } else {
        await departmentService.update(departmentEditor.item.id, nextPayload)
        toast.success('Department Updated', `"${payload.name}" has been updated.`)
      }

      setDepartmentEditor(DEFAULT_DEPARTMENT_EDITOR)
      await fetchDepartments()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to save department.'))
    } finally {
      setSavingDepartment(false)
    }
  }

  const handleSaveTeam = async (payload) => {
    if (!selectedDepartment?.id) {
      toast.warning('Select Department', 'Please select a department before adding a team.')
      return
    }

    setSavingTeam(true)
    try {
      const nextPayload = cleanPayload(payload)

      if (teamEditor.mode === 'create') {
        await teamService.create({
          ...nextPayload,
          departmentId: selectedDepartment.id,
        })
        toast.success('Team Created', `"${payload.name}" has been added to "${selectedDepartment.name}".`)
      } else {
        await teamService.update(teamEditor.item.id, nextPayload)
        toast.success('Team Updated', `"${payload.name}" has been updated.`)
      }

      setTeamEditor(DEFAULT_TEAM_EDITOR)
      await Promise.all([
        fetchDepartmentTeams(selectedDepartment.id),
        fetchTeamOverview(),
      ])
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to save team.'))
    } finally {
      setSavingTeam(false)
    }
  }

  const handleToggleDepartmentStatus = async (department) => {
    setUpdatingDepartmentId(department.id)
    try {
      await departmentService.update(department.id, { isActive: !department.isActive })
      toast.success(
        department.isActive ? 'Department Deactivated' : 'Department Activated',
        `"${department.name}" is now ${department.isActive ? 'inactive' : 'active'}.`
      )
      await fetchDepartments()
    } catch (error) {
      toast.error('Status Update Failed', getErrorMessage(error, 'Failed to update department status.'))
    } finally {
      setUpdatingDepartmentId(null)
    }
  }

  const handleToggleTeamStatus = async (team) => {
    if (!selectedDepartment?.id) return

    setUpdatingTeamId(team.id)
    try {
      await teamService.update(team.id, { isActive: !team.isActive })
      toast.success(
        team.isActive ? 'Team Deactivated' : 'Team Activated',
        `"${team.name}" is now ${team.isActive ? 'inactive' : 'active'}.`
      )
      await Promise.all([
        fetchDepartmentTeams(selectedDepartment.id),
        fetchTeamOverview(),
      ])
    } catch (error) {
      toast.error('Status Update Failed', getErrorMessage(error, 'Failed to update team status.'))
    } finally {
      setUpdatingTeamId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      if (deleteTarget.type === 'department') {
        await departmentService.delete(deleteTarget.item.id)
        toast.success('Department Deleted', `"${deleteTarget.item.name}" has been deleted.`)
        if (selectedDepartmentId === deleteTarget.item.id) {
          setSelectedDepartmentId(null)
          setTeams([])
        }
        setDeleteTarget(null)
        await Promise.all([fetchDepartments(), fetchTeamOverview()])
      } else {
        await teamService.delete(deleteTarget.item.id)
        toast.success('Team Deleted', `"${deleteTarget.item.name}" has been deleted.`)
        setDeleteTarget(null)
        await Promise.all([
          selectedDepartmentId ? fetchDepartmentTeams(selectedDepartmentId) : Promise.resolve(),
          fetchTeamOverview(),
        ])
      }
    } catch (error) {
      toast.error('Delete Failed', getErrorMessage(error, 'Failed to delete item.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Departments</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Organize departments and manage the teams inside each one.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshCurrentData}
            disabled={departmentLoading || teamsLoading}
            className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-muted shadow-sm transition-all hover:text-ink disabled:opacity-50"
          >
            <RefreshCw size={15} className={departmentLoading || teamsLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <PermissionGuard permission="departments.CREATE">
            <button
              type="button"
              onClick={openCreateDepartment}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98]"
            >
              <Plus size={16} />
              Add Department
            </button>
          </PermissionGuard>
        </div>
      </div>

      <DepartmentSummary
        departmentCount={departments.length}
        activeDepartmentCount={activeDepartmentCount}
        teamCount={allTeams.length}
        selectedTeamCount={teams.length}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-surface-200 bg-white px-4 py-4 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={departmentSearch}
            onChange={(event) => setDepartmentSearch(event.target.value)}
            placeholder="Search departments..."
            className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink shadow-sm transition-all placeholder:text-ink-muted focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            <Filter size={14} />
            Status
          </div>
          {['all', 'active', 'inactive'].map((status) => (
            <button
              type="button"
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-surface-200 bg-white text-ink-muted hover:text-ink'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
        <DepartmentList
          departments={filteredDepartments}
          selectedDepartmentId={selectedDepartmentId}
          teamCounts={teamCounts}
          loading={departmentLoading}
          updatingId={updatingDepartmentId}
          onSelect={setSelectedDepartmentId}
          onEdit={openEditDepartment}
          onDelete={(department) => setDeleteTarget({ type: 'department', item: department })}
          onToggleStatus={handleToggleDepartmentStatus}
        />

        <TeamsPanel
          department={selectedDepartment}
          teams={teams}
          filteredTeams={filteredTeams}
          search={teamSearch}
          loading={teamsLoading}
          updatingId={updatingTeamId}
          onSearchChange={setTeamSearch}
          onCreate={openCreateTeam}
          onEdit={openEditTeam}
          onDelete={(team) => setDeleteTarget({ type: 'team', item: team })}
          onRefresh={() => fetchDepartmentTeams(selectedDepartmentId)}
          onToggleStatus={handleToggleTeamStatus}
        />
      </div>

      <DepartmentFormModal
        open={departmentEditor.open}
        mode={departmentEditor.mode}
        department={departmentEditor.item}
        saving={savingDepartment}
        onClose={closeDepartmentEditor}
        onSubmit={handleSaveDepartment}
      />

      <TeamFormModal
        open={teamEditor.open}
        mode={teamEditor.mode}
        team={teamEditor.item}
        department={selectedDepartment}
        saving={savingTeam}
        onClose={closeTeamEditor}
        onSubmit={handleSaveTeam}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        title={deleteTarget?.type === 'department' ? 'Delete Department' : 'Delete Team'}
        itemName={deleteTarget?.item?.name || ''}
        description={
          deleteTarget?.type === 'department'
            ? 'Teams linked to this department may also be affected.'
            : ''
        }
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
