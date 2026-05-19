/**
 * Menu Master Page
 *
 * Full CRUD admin page for managing navigation modules.
 * - Table view with search
 * - Create / Edit modal (with permission checkboxes for CRUD)
 * - Delete confirmation
 * - Toast notifications for success/error
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, Search, X, Loader2, Menu,
  ChevronDown, ExternalLink, AlertTriangle, Check, RefreshCw,
} from 'lucide-react'
import * as Icons from 'lucide-react'
import moduleService from '../../apis/services/rbac/module.service'
import permissionService from '../../apis/services/rbac/permission.service'
import PermissionGuard from '../../components/common/PermissionGuard'
import { toast } from '../../components/common/Toast'

const ICON_OPTIONS = [
  'LayoutDashboard', 'Users', 'FolderKanban', 'Settings', 'ShieldCheck',
  'Building2', 'BarChart3', 'TrendingUp', 'Zap', 'BookOpen',
  'CheckSquare', 'FileText', 'Package', 'ShoppingCart', 'CreditCard',
  'Bell', 'Mail', 'Calendar', 'Clock', 'Globe',
  'Lock', 'Key', 'Database', 'Server', 'Cloud',
  'Code', 'Terminal', 'Layers', 'Grid3X3', 'List',
  'Home', 'Star', 'Heart', 'Flag', 'Tag',
  'Briefcase', 'Circle', 'Dot',
]

const EMPTY_FORM = {
  name: '', key: '', path: '', icon: 'Circle',
  parentId: '', sortOrder: 0, isActive: true,
  selectedPermissions: [],
}

export default function MenuMaster() {
  const [modules, setModules] = useState([])
  const [allPermissions, setAllPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false)

  // ── Fetch ──────────────────────────────────────────────────
  const fetchModules = useCallback(async () => {
    try {
      setLoading(true)
      const data = await moduleService.list()
      setModules(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      toast.error('Failed to load modules', err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPermissions = useCallback(async () => {
    try {
      const data = await permissionService.list()
      setAllPermissions(Array.isArray(data) ? data : data?.data || [])
    } catch { /* permissions list is optional */ }
  }, [])

  useEffect(() => { fetchModules(); fetchPermissions() }, [fetchModules, fetchPermissions])

  const filtered = modules.filter((m) => {
    if (!search) return true
    const q = search.toLowerCase()
    return m.name?.toLowerCase().includes(q) || m.key?.toLowerCase().includes(q) || m.path?.toLowerCase().includes(q)
  })

  const parentOptions = modules.filter((m) => !m.parentId && m.id !== editingId)

  // ── Modal ──────────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const openEdit = async (mod) => {
    let selectedPerms = ['CREATE', 'READ', 'UPDATE', 'DELETE']
    try {
      const permData = await moduleService.getPermissions(mod.id)
      const perms = Array.isArray(permData) ? permData : permData?.data || []
      selectedPerms = perms.map((p) => p.key || p.permissionKey || p.name).filter(Boolean)
    } catch { /* fallback to all */ }

    setForm({
      name: mod.name || '', key: mod.key || '', path: mod.path || '',
      icon: mod.icon || 'Circle', parentId: mod.parentId || '',
      sortOrder: mod.sortOrder ?? 0, isActive: mod.isActive ?? true,
      selectedPermissions: selectedPerms,
    })
    setEditingId(mod.id)
    setModalMode('edit')
    setModalOpen(true)
  }

  const closeModal = () => { if (!saving) { setModalOpen(false); setIconDropdownOpen(false) } }

  const handleFormChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const togglePermAction = (action) => {
    setForm((prev) => {
      const has = prev.selectedPermissions.includes(action)
      return {
        ...prev,
        selectedPermissions: has
          ? prev.selectedPermissions.filter((a) => a !== action)
          : [...prev.selectedPermissions, action],
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.key.trim() || !form.path.trim()) {
      toast.warning('Validation Error', 'Name, Key, and Path are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(), key: form.key.trim(), path: form.path.trim(),
        icon: form.icon, parentId: form.parentId || null,
        sortOrder: Number(form.sortOrder) || 0, isActive: form.isActive,
      }

      let moduleId = editingId
      if (modalMode === 'create') {
        const result = await moduleService.create(payload)
        moduleId = result?.id || result?.data?.id
        toast.success('Module Created', `"${form.name}" has been created.`)
      } else {
        await moduleService.update(editingId, payload)
        toast.success('Module Updated', `"${form.name}" has been updated.`)
      }

      // Assign permissions to the module
      if (moduleId && form.selectedPermissions.length > 0) {
        try {
          const permIds = allPermissions
            .filter((p) => form.selectedPermissions.includes(p.key || p.name))
            .map((p) => p.id)
          if (permIds.length > 0) {
            await moduleService.assignPermissions(moduleId, { permissionIds: permIds })
          }
        } catch { /* permission assignment is best-effort */ }
      }

      setModalOpen(false)
      fetchModules()
    } catch (err) {
      const msg = err?.response?.data?.message
      toast.error('Save Failed', Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save module.')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await moduleService.delete(deleteTarget.id)
      toast.success('Module Deleted', `"${deleteTarget.name}" has been deleted.`)
      setDeleteTarget(null)
      await fetchModules()
    } catch (err) {
      toast.error('Delete Failed', err?.response?.data?.message || 'Failed to delete module.')
    } finally {
      setDeleting(false)
    }
  }

  const getParentName = (parentId) => modules.find((m) => m.id === parentId)?.name || '—'
  const renderIcon = (iconName, size = 16) => { const Ic = Icons[iconName] || Icons.Circle; return <Ic size={size} /> }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Menu Master</h2>
          <p className="text-sm text-ink-muted mt-1">Create and manage navigation modules, URLs, and their permissions.</p>
        </div>
        <PermissionGuard permission="menu-master.CREATE">
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <Plus size={16} /> Add Module
          </button>
        </PermissionGuard>
      </div>

      {/* Search & Refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="text" placeholder="Search modules..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-ink placeholder:text-ink-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all" />
        </div>
        <button onClick={fetchModules} disabled={loading} className="flex items-center px-3 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-ink-muted shadow-sm hover:text-ink hover:border-surface-300 transition-all disabled:opacity-50">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-surface-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-100/50">
                <th className="text-left px-5 py-3.5 font-semibold text-ink-muted text-xs uppercase tracking-wider">Module</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-muted text-xs uppercase tracking-wider">Key</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-muted text-xs uppercase tracking-wider">Path</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-muted text-xs uppercase tracking-wider">Parent</th>
                <th className="text-center px-5 py-3.5 font-semibold text-ink-muted text-xs uppercase tracking-wider">Order</th>
                <th className="text-center px-5 py-3.5 font-semibold text-ink-muted text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3.5 font-semibold text-ink-muted text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-16"><Loader2 size={24} className="text-amber-500 animate-spin mx-auto mb-2" /><p className="text-sm text-ink-muted">Loading modules...</p></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16"><Menu size={24} className="text-ink-muted mx-auto mb-2" /><p className="text-sm text-ink-muted">{search ? 'No modules match.' : 'No modules yet.'}</p></td></tr>
              ) : filtered.map((mod) => (
                <tr key={mod.id} className="border-b border-surface-100 last:border-0 hover:bg-surface-100/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center text-amber-600">{renderIcon(mod.icon, 15)}</div>
                      <span className="font-medium text-ink">{mod.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><code className="text-xs font-mono px-2 py-1 rounded-md bg-surface-100 text-ink-muted">{mod.key}</code></td>
                  <td className="px-5 py-3.5"><div className="flex items-center gap-1.5 text-ink-muted"><ExternalLink size={12} /><span className="text-xs font-mono">{mod.path}</span></div></td>
                  <td className="px-5 py-3.5 text-ink-muted">{mod.parentId ? getParentName(mod.parentId) : '—'}</td>
                  <td className="px-5 py-3.5 text-center text-ink-muted">{mod.sortOrder ?? 0}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${mod.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${mod.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {mod.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <PermissionGuard permission="menu-master.UPDATE">
                        <button onClick={() => openEdit(mod)} className="p-2 rounded-lg text-ink-muted hover:text-amber-600 hover:bg-amber-50 transition-all" title="Edit"><Pencil size={14} /></button>
                      </PermissionGuard>
                      <PermissionGuard permission="menu-master.DELETE">
                        <button onClick={() => setDeleteTarget(mod)} className="p-2 rounded-lg text-ink-muted hover:text-red-600 hover:bg-red-50 transition-all" title="Delete"><Trash2 size={14} /></button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-surface-100 bg-surface-100/30">
            <p className="text-xs text-ink-muted">Showing <span className="font-semibold text-ink">{filtered.length}</span> of <span className="font-semibold text-ink">{modules.length}</span> modules</p>
          </div>
        )}
      </div>

      {/* ── Create/Edit Modal ──────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={closeModal}>
          <div className="w-full max-w-lg rounded-2xl border border-surface-200 bg-white shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-100">
              <div>
                <h3 className="text-lg font-semibold text-ink">{modalMode === 'create' ? 'Create Module' : 'Edit Module'}</h3>
                <p className="text-xs text-ink-muted mt-0.5">{modalMode === 'create' ? 'Add a new navigation module with permissions.' : 'Update module details and permissions.'}</p>
              </div>
              <button onClick={closeModal} disabled={saving} className="p-2 rounded-lg text-ink-muted hover:bg-surface-100 hover:text-ink transition-all disabled:opacity-50"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Name & Key */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => handleFormChange('name', e.target.value)} placeholder="e.g. Inventory" className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">Key *</label>
                  <input type="text" value={form.key} onChange={(e) => handleFormChange('key', e.target.value)} placeholder="e.g. inventory" className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all" />
                </div>
              </div>

              {/* Path */}
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Path (URL) *</label>
                <input type="text" value={form.path} onChange={(e) => handleFormChange('path', e.target.value)} placeholder="e.g. /inventory" className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all" />
              </div>

              {/* Icon & Parent */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">Icon</label>
                  <button type="button" onClick={() => setIconDropdownOpen(!iconDropdownOpen)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                    <span className="flex items-center gap-2">{renderIcon(form.icon, 15)}<span className="text-ink">{form.icon}</span></span>
                    <ChevronDown size={14} className="text-ink-muted" />
                  </button>
                  {iconDropdownOpen && (
                    <div className="absolute z-20 top-full mt-1 left-0 right-0 max-h-48 overflow-y-auto rounded-xl border border-surface-200 bg-white shadow-xl">
                      {ICON_OPTIONS.map((iconName) => (
                        <button key={iconName} type="button" onClick={() => { handleFormChange('icon', iconName); setIconDropdownOpen(false) }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-surface-100 transition-colors ${form.icon === iconName ? 'bg-amber-50 text-amber-700' : 'text-ink'}`}>
                          {renderIcon(iconName, 14)}<span className="truncate">{iconName}</span>
                          {form.icon === iconName && <Check size={13} className="ml-auto text-amber-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">Parent Module</label>
                  <select value={form.parentId} onChange={(e) => handleFormChange('parentId', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                    <option value="">None (Top Level)</option>
                    {parentOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Sort Order & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => handleFormChange('sortOrder', e.target.value)} min={0} className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div onClick={() => handleFormChange('isActive', !form.isActive)} className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${form.isActive ? 'bg-emerald-500' : 'bg-surface-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm font-medium text-ink">{form.isActive ? 'Active' : 'Inactive'}</span>
                  </label>
                </div>
              </div>

              {/* ── Permissions Section ──────────────────────────── */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-ink-muted mb-2">Module Permissions</label>
                <p className="text-[11px] text-ink-muted mb-3">Select which actions are available for this module. These can then be assigned to roles.</p>
                <div className="flex flex-wrap gap-2">
                  {allPermissions.map((perm) => {
                    const action = perm.key || perm.permissionKey || perm.name
                    const selected = form.selectedPermissions.includes(action)
                    return (
                      <button
                        key={action}
                        type="button"
                        onClick={() => togglePermAction(action)}
                        className={`
                          flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200
                          ${selected
                            ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
                            : 'bg-white border-surface-200 text-ink-muted hover:border-surface-300'}
                        `}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${selected ? 'bg-amber-500 text-white' : 'bg-surface-100'}`}>
                          {selected && <Check size={12} strokeWidth={3} />}
                        </div>
                        {perm.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
                <button type="button" onClick={closeModal} disabled={saving} className="px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm font-medium text-ink hover:bg-surface-50 transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-md shadow-amber-500/25 hover:shadow-lg transition-all disabled:opacity-70">
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {modalMode === 'create' ? 'Create Module' : 'Save Changes'}
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
                <div><h3 className="text-base font-semibold text-ink">Delete Module</h3><p className="text-xs text-ink-muted">This action cannot be undone.</p></div>
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
