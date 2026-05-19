/**
 * Role Master Page
 *
 * Full CRUD for roles + permission assignment matrix.
 * - Left panel: role list with CRUD
 * - Right panel: permission matrix (modules × CRUD actions)
 * - Toast notifications for all feedback
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, Search, X, Loader2, Shield,
  AlertTriangle, RefreshCw, ChevronRight, Check, Save,
} from 'lucide-react'
import roleService from '../../apis/services/rbac/role.service'
import PermissionGuard from '../../components/common/PermissionGuard'
import { toast } from '../../components/common/Toast'

const EMPTY_FORM = { name: '', description: '' }

export default function RoleMaster() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [selectedRole, setSelectedRole] = useState(null)
  const [permData, setPermData] = useState([])
  const [permLoading, setPermLoading] = useState(false)
  const [permSaving, setPermSaving] = useState(false)

  // ── Fetch roles ────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      const data = await roleService.list()
      setRoles(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      toast.error('Failed to load roles', err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  const filtered = roles.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
  })

  // ── Role CRUD modal ────────────────────────────────────────
  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setModalMode('create'); setModalOpen(true) }
  const openEdit = (role) => { setForm({ name: role.name || '', description: role.description || '' }); setEditingId(role.id); setModalMode('edit'); setModalOpen(true) }
  const closeModal = () => { if (!saving) setModalOpen(false) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.warning('Validation', 'Role name is required.'); return }
    setSaving(true)
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() }
      if (modalMode === 'create') {
        await roleService.create(payload)
        toast.success('Role Created', `"${form.name}" has been created.`)
      } else {
        await roleService.update(editingId, payload)
        toast.success('Role Updated', `"${form.name}" has been updated.`)
      }
      setModalOpen(false)
      await fetchRoles()
    } catch (err) {
      const msg = err?.response?.data?.message
      toast.error('Save Failed', Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save role.')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await roleService.delete(deleteTarget.id)
      toast.success('Role Deleted', `"${deleteTarget.name}" has been deleted.`)
      if (selectedRole?.id === deleteTarget.id) { setSelectedRole(null); setPermData([]) }
      setDeleteTarget(null)
      await fetchRoles()
    } catch (err) {
      toast.error('Delete Failed', err?.response?.data?.message || 'Failed to delete role.')
    } finally {
      setDeleting(false)
    }
  }

  // ── Permission panel ───────────────────────────────────────
  const normalizePermData = (raw) => {
    const arr = Array.isArray(raw) ? raw : raw?.data || []
    return arr.map((mod) => ({
      moduleId: mod.moduleId || mod.id,
      moduleName: mod.moduleName || mod.name,
      moduleKey: mod.moduleKey || mod.key,
      permissions: (mod.permissions || []).map((p) => ({
        ...p,
        permissionId: p.permissionId || p.id,
        permissionKey: p.permissionKey || p.key,
        permissionName: p.permissionName || p.name,
        modulePermissionId: p.modulePermissionId || p.id,
        allowed: typeof p.allowed === 'boolean' ? p.allowed : false,
      })),
    }))
  }

  const loadPermissions = async (role) => {
    setSelectedRole(role)
    setPermLoading(true)
    try {
      const data = await roleService.getRolePermissions(role.id)
      setPermData(normalizePermData(data))
    } catch (err) {
      toast.error('Permission Load Failed', err?.response?.data?.message || 'Failed to load permissions.')
      setPermData([])
    } finally {
      setPermLoading(false)
    }
  }

  const togglePermission = (modIdx, permIdx) => {
    setPermData((prev) => prev.map((m, mi) => mi !== modIdx ? m : {
      ...m, permissions: m.permissions.map((p, pi) => pi === permIdx ? { ...p, allowed: !p.allowed } : p),
    }))
  }

  const toggleModuleAll = (modIdx) => {
    setPermData((prev) => {
      const allChecked = prev[modIdx].permissions.every((p) => p.allowed)
      return prev.map((m, mi) => mi !== modIdx ? m : { ...m, permissions: m.permissions.map((p) => ({ ...p, allowed: !allChecked })) })
    })
  }

  const toggleColumnAll = (actionKey) => {
    setPermData((prev) => {
      const allChecked = prev.every((mod) => mod.permissions.filter((p) => p.permissionKey === actionKey).every((p) => p.allowed))
      return prev.map((mod) => ({
        ...mod, permissions: mod.permissions.map((p) => p.permissionKey === actionKey ? { ...p, allowed: !allChecked } : p),
      }))
    })
  }

  const savePermissions = async () => {
    if (!selectedRole) return
    setPermSaving(true)
    try {
      const modules = permData.map((mod) => ({
        moduleId: mod.moduleId,
        permissionIds: mod.permissions.filter((p) => p.allowed).map((p) => p.permissionId),
      })).filter((mod) => mod.permissionIds.length > 0)
      await roleService.assignPermissions(selectedRole.id, { modules })
      toast.success('Permissions Saved', `Permissions for "${selectedRole.name}" have been updated.`)
    } catch (err) {
      toast.error('Save Failed', err?.response?.data?.message || 'Failed to save permissions.')
    } finally {
      setPermSaving(false)
    }
  }

  // Extract unique actions across all modules for dynamic column headers
  const dynamicActions = Array.from(
    new Set(
      permData.flatMap((mod) => mod.permissions.map((p) => p.permissionKey))
    )
  ).filter(Boolean)

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Role Master</h2>
          <p className="text-sm text-ink-muted mt-1">Manage roles and assign module permissions to control access.</p>
        </div>
        <PermissionGuard permission="role-master.CREATE">
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <Plus size={16} /> Add Role
          </button>
        </PermissionGuard>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="text" placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-ink placeholder:text-ink-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all" />
        </div>
        <button onClick={fetchRoles} disabled={loading} className="flex items-center px-3 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-ink-muted shadow-sm hover:text-ink hover:border-surface-300 transition-all disabled:opacity-50">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Roles List ─────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-surface-200 bg-white shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-surface-100 bg-surface-100/50">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Roles ({filtered.length})</p>
            </div>
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-12"><Loader2 size={24} className="text-amber-500 animate-spin" /><p className="text-sm text-ink-muted">Loading...</p></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12"><Shield size={24} className="text-ink-muted" /><p className="text-sm text-ink-muted">{search ? 'No match.' : 'No roles yet.'}</p></div>
            ) : (
              <div className="divide-y divide-surface-100 max-h-[60vh] overflow-y-auto">
                {filtered.map((role) => (
                  <div key={role.id} onClick={() => loadPermissions(role)} className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-all duration-150 hover:bg-surface-100/50 ${selectedRole?.id === role.id ? 'bg-amber-50/50 border-l-2 border-l-amber-500' : ''}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedRole?.id === role.id ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-surface-100 text-ink-muted'}`}>
                      <Shield size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{role.name?.replace(/_/g, ' ')}</p>
                      <p className="text-[11px] text-ink-muted truncate">{role.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <PermissionGuard permission="role-master.UPDATE">
                        <button onClick={(e) => { e.stopPropagation(); openEdit(role) }} className="p-1.5 rounded-lg text-ink-muted hover:text-amber-600 hover:bg-amber-50 transition-all" title="Edit"><Pencil size={13} /></button>
                      </PermissionGuard>
                      <PermissionGuard permission="role-master.DELETE">
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(role) }} className="p-1.5 rounded-lg text-ink-muted hover:text-red-600 hover:bg-red-50 transition-all" title="Delete"><Trash2 size={13} /></button>
                      </PermissionGuard>
                      <ChevronRight size={14} className="text-ink-muted ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Permission Matrix ──────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-surface-200 bg-white shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-100 bg-surface-100/50">
              <div>
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Assign Modules & Permissions to Role</p>
                {selectedRole && <p className="text-[11px] text-ink-muted mt-0.5">Role: <span className="font-semibold text-ink">{selectedRole.name?.replace(/_/g, ' ')}</span></p>}
              </div>
              {selectedRole && permData.length > 0 && (
                <PermissionGuard permission="role-master.UPDATE">
                  <button onClick={savePermissions} disabled={permSaving || permLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow-md shadow-amber-500/25 hover:shadow-lg transition-all disabled:opacity-70">
                    {permSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    {permSaving ? 'Saving...' : 'Save Permissions'}
                  </button>
                </PermissionGuard>
              )}
            </div>

            {!selectedRole ? (
              <div className="flex flex-col items-center gap-4 py-20 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center"><Shield size={28} className="text-ink-muted" /></div>
                <div>
                  <p className="text-sm font-medium text-ink">Select a role to assign permissions</p>
                  <p className="text-xs text-ink-muted mt-1">Click on any role from the list to view and manage its module permissions.</p>
                </div>
              </div>
            ) : permLoading ? (
              <div className="flex flex-col items-center gap-3 py-16"><Loader2 size={24} className="text-amber-500 animate-spin" /><p className="text-sm text-ink-muted">Loading permissions...</p></div>
            ) : permData.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <Shield size={24} className="text-ink-muted" />
                <p className="text-sm text-ink-muted">No modules found. Create modules in Menu Master first, then assign permissions here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-100">
                      <th className="text-left px-5 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wider min-w-[160px]">Module</th>
                      {dynamicActions.map((action) => (
                        <th key={action} className="text-center px-3 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wider">
                          <button onClick={() => toggleColumnAll(action)} className="hover:text-amber-600 transition-colors" title={`Toggle all ${action}`}>{action}</button>
                        </th>
                      ))}
                      <th className="text-center px-3 py-3 font-semibold text-ink-muted text-xs uppercase tracking-wider">All</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permData.map((mod, modIdx) => {
                      const allChecked = mod.permissions.every((p) => p.allowed)
                      return (
                        <tr key={mod.moduleId || modIdx} className="border-b border-surface-100 last:border-0 hover:bg-surface-100/30 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center text-amber-600"><Shield size={13} /></div>
                              <div>
                                <span className="font-medium text-ink text-sm block">{mod.moduleName}</span>
                                <span className="text-[10px] text-ink-muted font-mono">{mod.moduleKey}</span>
                              </div>
                            </div>
                          </td>
                          {dynamicActions.map((action) => {
                            const perm = mod.permissions.find((p) => p.permissionKey === action)
                            const permIdx = mod.permissions.indexOf(perm)
                            if (!perm) return <td key={action} className="text-center px-3 py-3"><span className="text-ink-muted text-xs">—</span></td>
                            return (
                              <td key={action} className="text-center px-3 py-3">
                                <button onClick={() => togglePermission(modIdx, permIdx)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 mx-auto ${perm.allowed ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 shadow-sm' : 'bg-surface-100 text-surface-400 hover:bg-surface-200'}`}>
                                  {perm.allowed ? <Check size={14} strokeWidth={3} /> : <X size={14} />}
                                </button>
                              </td>
                            )
                          })}
                          <td className="text-center px-3 py-3">
                            <button onClick={() => toggleModuleAll(modIdx)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 mx-auto ${allChecked ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-surface-100 text-surface-400 hover:bg-surface-200'}`}>
                              {allChecked ? <Check size={14} strokeWidth={3} /> : <X size={14} />}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Create/Edit Modal ──────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={closeModal}>
          <div className="w-full max-w-md rounded-2xl border border-surface-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-100">
              <h3 className="text-lg font-semibold text-ink">{modalMode === 'create' ? 'Create Role' : 'Edit Role'}</h3>
              <button onClick={closeModal} disabled={saving} className="p-2 rounded-lg text-ink-muted hover:bg-surface-100 hover:text-ink transition-all disabled:opacity-50"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Role Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. MANAGER" className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description..." rows={3} className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
                <button type="button" onClick={closeModal} disabled={saving} className="px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm font-medium text-ink hover:bg-surface-50 transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-md shadow-amber-500/25 hover:shadow-lg transition-all disabled:opacity-70">
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {modalMode === 'create' ? 'Create Role' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ───────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-surface-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center"><AlertTriangle size={20} className="text-red-500" /></div>
                <div><h3 className="text-base font-semibold text-ink">Delete Role</h3><p className="text-xs text-ink-muted">This action cannot be undone.</p></div>
              </div>
              <p className="text-sm text-ink-muted">Are you sure you want to delete <span className="font-semibold text-ink">"{deleteTarget.name}"</span>?</p>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-6">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="px-4 py-2 rounded-xl border border-surface-200 bg-white text-sm font-medium text-ink hover:bg-surface-50 transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-70">
                {deleting && <Loader2 size={14} className="animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
