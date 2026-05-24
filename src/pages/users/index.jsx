import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import userService from '../../apis/services/users/user.service'
import roleService from '../../apis/services/rbac/role.service'
import departmentService from '../../apis/services/departments/department.service'
import teamService from '../../apis/services/departments/team.service'
import PermissionGuard from '../../components/common/PermissionGuard'
import { toast } from '../../components/common/Toast'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import UserFormModal from './components/UserFormModal'
import UserSummary from './components/UserSummary'
import UserTable from './components/UserTable'
import UserToolbar from './components/UserToolbar'

const DEFAULT_FILTERS = {
  roleId: '',
  departmentId: '',
  teamId: '',
  isActive: '',
}

const DEFAULT_EDITOR = {
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

const normalizeActive = (isActive, status) => {
  if (typeof isActive === 'boolean') return isActive
  if (typeof isActive === 'string') return isActive.toLowerCase() !== 'false'
  if (typeof status === 'string') return status.toLowerCase() !== 'inactive'
  return true
}

const getErrorMessage = (error, fallback) => {
  const message = error?.response?.data?.message || error?.response?.data?.error || error?.message
  return Array.isArray(message) ? message.join(', ') : message || fallback
}

const normalizeRole = (role) => ({
  id: getEntityId(role, 'roleId'),
  name: role?.name || role?.roleName || 'Untitled Role',
})

const normalizeDepartment = (department) => ({
  id: getEntityId(department, 'departmentId'),
  name: department?.name || department?.departmentName || 'Untitled Department',
})

const resolveTeamDepartmentId = (team) => {
  const direct = team?.departmentId || team?.department_id
  if (direct !== undefined && direct !== null) return String(direct)
  return getEntityId(team?.department, 'departmentId')
}

const normalizeTeam = (team) => ({
  id: getEntityId(team, 'teamId'),
  departmentId: resolveTeamDepartmentId(team),
  name: team?.name || team?.teamName || 'Untitled Team',
  description: team?.description || '',
})

const getTeamIds = (user) => {
  if (Array.isArray(user?.teamIds)) {
    return user.teamIds.map(String)
  }
  if (Array.isArray(user?.teams)) {
    return user.teams
      .map((team) => typeof team === 'string' ? team : getEntityId(team, 'teamId'))
      .filter(Boolean)
  }
  return []
}

const normalizeUser = (user) => {
  const firstName = user?.firstName || user?.first_name || ''
  const lastName = user?.lastName || user?.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim() || user?.name || user?.email || 'Untitled User'
  const roleId = user?.roleId || getEntityId(user?.role, 'roleId')
  const departmentId = user?.departmentId || getEntityId(user?.department, 'departmentId')
  const teams = Array.isArray(user?.teams) ? user.teams : []

  return {
    id: getEntityId(user, 'userId'),
    firstName,
    lastName,
    fullName,
    email: user?.email || '',
    roleId: roleId ? String(roleId) : '',
    roleName: user?.role?.name || user?.roleName || '',
    departmentId: departmentId ? String(departmentId) : '',
    departmentName: user?.department?.name || user?.departmentName || '',
    teamIds: getTeamIds(user),
    teamNames: teams.map((team) => typeof team === 'string' ? team : team?.name || team?.teamName).filter(Boolean),
    isActive: normalizeActive(user?.isActive, user?.status),
    raw: user,
  }
}

const withDisplayNames = (user, roleMap, departmentMap, teamMap) => ({
  ...user,
  roleName: user.roleName || roleMap[user.roleId] || '',
  departmentName: user.departmentName || departmentMap[user.departmentId] || '',
  teamNames: user.teamNames.length > 0
    ? user.teamNames
    : user.teamIds.map((teamId) => teamMap[teamId]).filter(Boolean),
})

const toBooleanFilter = (value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

const cleanPayload = (payload, mode) => {
  const nextPayload = {
    firstName: payload.firstName,
    lastName: payload.lastName || undefined,
    email: payload.email,
    roleId: payload.roleId || undefined,
    departmentId: payload.departmentId || undefined,
    teamIds: payload.teamIds || [],
    isActive: payload.isActive,
  }

  if (mode === 'create' || payload.password) {
    nextPayload.password = payload.password
  }

  return nextPayload
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [teams, setTeams] = useState([])

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(true)
  const [metadataLoading, setMetadataLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const [editor, setEditor] = useState(DEFAULT_EDITOR)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const roleMap = useMemo(() => roles.reduce((map, role) => ({ ...map, [role.id]: role.name }), {}), [roles])
  const departmentMap = useMemo(() => departments.reduce((map, department) => ({ ...map, [department.id]: department.name }), {}), [departments])
  const teamMap = useMemo(() => teams.reduce((map, team) => ({ ...map, [team.id]: team.name }), {}), [teams])

  const loadMetadata = useCallback(async () => {
    try {
      setMetadataLoading(true)
      const [rolesResponse, departmentsResponse, teamsResponse] = await Promise.all([
        roleService.list(),
        departmentService.list({ page: 1, limit: 200, sortBy: 'name', sortOrder: 'ASC' }),
        teamService.list({ page: 1, limit: 500, sortBy: 'name', sortOrder: 'ASC' }),
      ])

      setRoles(extractList(rolesResponse, 'roles').map(normalizeRole).filter((role) => role.id))
      setDepartments(extractList(departmentsResponse, 'departments').map(normalizeDepartment).filter((department) => department.id))
      setTeams(extractList(teamsResponse, 'teams').map(normalizeTeam).filter((team) => team.id))
    } catch (error) {
      toast.error('Failed to load assignments', getErrorMessage(error, 'Failed to load roles, departments, or teams.'))
    } finally {
      setMetadataLoading(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      }

      if (search.trim()) params.search = search.trim()
      if (filters.roleId) params.roleId = filters.roleId
      if (filters.departmentId) params.departmentId = filters.departmentId
      if (filters.teamId) params.teamId = filters.teamId
      const isActive = toBooleanFilter(filters.isActive)
      if (typeof isActive === 'boolean') params.isActive = isActive

      const response = await userService.list(params)
      const normalized = extractList(response, 'users').map(normalizeUser).filter((user) => user.id)
      setUsers(normalized)
    } catch (error) {
      toast.error('Failed to load users', getErrorMessage(error, 'Failed to load users.'))
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [filters, search])

  useEffect(() => {
    loadMetadata()
  }, [loadMetadata])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const enrichedUsers = useMemo(
    () => users.map((user) => withDisplayNames(user, roleMap, departmentMap, teamMap)),
    [departmentMap, roleMap, teamMap, users]
  )

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return enrichedUsers

    return enrichedUsers.filter((user) => (
      user.fullName.toLowerCase().includes(query)
      || user.email.toLowerCase().includes(query)
      || user.roleName.toLowerCase().includes(query)
      || user.departmentName.toLowerCase().includes(query)
      || user.teamNames.some((teamName) => teamName.toLowerCase().includes(query))
    ))
  }, [enrichedUsers, search])

  const activeUserCount = useMemo(
    () => enrichedUsers.filter((user) => user.isActive).length,
    [enrichedUsers]
  )

  const handleFilterChange = (field, value) => {
    setFilters((previous) => {
      if (field === 'departmentId') {
        const allowedTeamIds = teams.filter((team) => team.departmentId === value).map((team) => team.id)
        return {
          ...previous,
          departmentId: value,
          teamId: allowedTeamIds.includes(previous.teamId) ? previous.teamId : '',
        }
      }
      return { ...previous, [field]: value }
    })
  }

  const refreshAll = async () => {
    await Promise.all([loadMetadata(), fetchUsers()])
  }

  const openCreate = () => {
    setEditor({ open: true, mode: 'create', item: null })
  }

  const openEdit = async (user) => {
    setEditingId(user.id)
    try {
      const response = await userService.getById(user.id)
      const fullUser = normalizeUser(extractEntity(response, 'user') || user.raw || user)
      setEditor({
        open: true,
        mode: 'edit',
        item: withDisplayNames(fullUser, roleMap, departmentMap, teamMap),
      })
    } catch (error) {
      toast.error('Failed to load user', getErrorMessage(error, 'Failed to load user details.'))
    } finally {
      setEditingId(null)
    }
  }

  const closeEditor = () => {
    if (!saving) setEditor(DEFAULT_EDITOR)
  }

  const handleSave = async (payload) => {
    setSaving(true)
    try {
      const nextPayload = cleanPayload(payload, editor.mode)
      if (editor.mode === 'create') {
        await userService.create(nextPayload)
        toast.success('User Created', `"${payload.firstName}" has been created.`)
      } else {
        await userService.update(editor.item.id, nextPayload)
        toast.success('User Updated', `"${payload.firstName}" has been updated.`)
      }

      setEditor(DEFAULT_EDITOR)
      await fetchUsers()
    } catch (error) {
      toast.error('Save Failed', getErrorMessage(error, 'Failed to save user.'))
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (user) => {
    setUpdatingId(user.id)
    try {
      await userService.update(user.id, { isActive: !user.isActive })
      toast.success(
        user.isActive ? 'User Deactivated' : 'User Activated',
        `"${user.fullName}" is now ${user.isActive ? 'inactive' : 'active'}.`
      )
      await fetchUsers()
    } catch (error) {
      toast.error('Status Update Failed', getErrorMessage(error, 'Failed to update user status.'))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      await userService.delete(deleteTarget.id)
      toast.success('User Deleted', `"${deleteTarget.fullName}" has been deleted.`)
      setDeleteTarget(null)
      await fetchUsers()
    } catch (error) {
      toast.error('Delete Failed', getErrorMessage(error, 'Failed to delete user.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Users</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Manage users and assign their role, department, and teams.
          </p>
        </div>
        <PermissionGuard permission="users.CREATE">
          <button
            type="button"
            onClick={openCreate}
            disabled={metadataLoading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98] disabled:opacity-70"
          >
            <Plus size={16} />
            Add User
          </button>
        </PermissionGuard>
      </div>

      <UserSummary
        userCount={enrichedUsers.length}
        activeUserCount={activeUserCount}
        departmentCount={departments.length}
        roleCount={roles.length}
      />

      <UserToolbar
        search={search}
        filters={filters}
        roles={roles}
        departments={departments}
        teams={teams}
        loading={loading || metadataLoading}
        onSearchChange={setSearch}
        onFilterChange={handleFilterChange}
        onRefresh={refreshAll}
      />

      <UserTable
        users={visibleUsers}
        loading={loading || metadataLoading}
        updatingId={updatingId}
        editingId={editingId}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onToggleStatus={handleToggleStatus}
      />

      <UserFormModal
        open={editor.open}
        mode={editor.mode}
        user={editor.item}
        roles={roles}
        departments={departments}
        teams={teams}
        saving={saving}
        onClose={closeEditor}
        onSubmit={handleSave}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        user={deleteTarget}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
