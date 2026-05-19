/**
 * Permission Master Page
 *
 * Full CRUD admin page for managing the global pool of permissions.
 * These permissions can later be assigned to modules in the Menu Master.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, Search, X, Loader2, Key,
  AlertTriangle, RefreshCw
} from 'lucide-react'
import permissionService from '../../apis/services/rbac/permission.service'
import PermissionGuard from '../../components/common/PermissionGuard'
import { toast } from '../../components/common/Toast'

const EMPTY_FORM = { name: '', key: '', description: '' }

export default function PermissionMaster() {
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // ── Fetch ──────────────────────────────────────────────────
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true)
      const data = await permissionService.list()
      setPermissions(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      toast.error('Failed to load permissions', err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPermissions() }, [fetchPermissions])

  const filtered = permissions.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name?.toLowerCase().includes(q) || p.key?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
  })

  // ── Modal ──────────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const openEdit = (perm) => {
    setForm({
      name: perm.name || '',
      key: perm.key || perm.permissionKey || '',
      description: perm.description || '',
    })
    setEditingId(perm.id)
    setModalMode('edit')
    setModalOpen(true)
  }

  const closeModal = () => { if (!saving) setModalOpen(false) }

  const handleFormChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.key.trim()) {
      toast.warning('Validation Error', 'Name and Key are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        key: form.key.trim(),
        description: form.description.trim() || null,
      }

      if (modalMode === 'create') {
        await permissionService.create(payload)
        toast.success('Permission Created', `"${form.name}" has been created.`)
      } else {
        await permissionService.update(editingId, payload)
        toast.success('Permission Updated', `"${form.name}" has been updated.`)
      }

      setModalOpen(false)
      fetchPermissions()
    } catch (err) {
      const msg = err?.response?.data?.message
      toast.error('Save Failed', Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save permission.')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await permissionService.delete(deleteTarget.id)
      toast.success('Permission Deleted', `"${deleteTarget.name}" has been deleted.`)
      setDeleteTarget(null)
      fetchPermissions()
    } catch (err) {
      toast.error('Delete Failed', err?.response?.data?.message || 'Failed to delete permission.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Permission Master</h2>
          <p className="text-sm text-ink-muted mt-1">Manage global permissions that can be assigned to modules.</p>
        </div>
        <PermissionGuard permission="permission-master.CREATE">
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <Plus size={16} /> Add Permission
          </button>
        </PermissionGuard>
      </div>

      {/* Search & Refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="text" placeholder="Search permissions..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-ink placeholder:text-ink-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all" />
        </div>
        <button onClick={fetchPermissions} disabled={loading} className="flex items-center px-3 py-2.5 rounded-xl border border-surface-200 bg-white text-sm text-ink-muted shadow-sm hover:text-ink hover:border-surface-300 transition-all disabled:opacity-50">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-surface-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-100/50">
                <th className="text-left px-5 py-3.5 font-semibold text-ink-muted text-xs uppercase tracking-wider">Permission Name</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-muted text-xs uppercase tracking-wider">Key</th>
                <th className="text-left px-5 py-3.5 font-semibold text-ink-muted text-xs uppercase tracking-wider">Description</th>
                <th className="text-right px-5 py-3.5 font-semibold text-ink-muted text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-16"><Loader2 size={24} className="text-amber-500 animate-spin mx-auto mb-2" /><p className="text-sm text-ink-muted">Loading permissions...</p></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-16"><Key size={24} className="text-ink-muted mx-auto mb-2" /><p className="text-sm text-ink-muted">{search ? 'No permissions match.' : 'No permissions yet.'}</p></td></tr>
              ) : filtered.map((perm) => (
                <tr key={perm.id} className="border-b border-surface-100 last:border-0 hover:bg-surface-100/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center text-amber-600"><Key size={15} /></div>
                      <span className="font-medium text-ink">{perm.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><code className="text-xs font-mono px-2 py-1 rounded-md bg-surface-100 text-ink-muted">{perm.key || perm.permissionKey}</code></td>
                  <td className="px-5 py-3.5"><span className="text-ink-muted">{perm.description || '—'}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <PermissionGuard permission="permission-master.UPDATE">
                        <button onClick={() => openEdit(perm)} className="p-2 rounded-lg text-ink-muted hover:text-amber-600 hover:bg-amber-50 transition-all" title="Edit"><Pencil size={14} /></button>
                      </PermissionGuard>
                      <PermissionGuard permission="permission-master.DELETE">
                        <button onClick={() => setDeleteTarget(perm)} className="p-2 rounded-lg text-ink-muted hover:text-red-600 hover:bg-red-50 transition-all" title="Delete"><Trash2 size={14} /></button>
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
            <p className="text-xs text-ink-muted">Showing <span className="font-semibold text-ink">{filtered.length}</span> of <span className="font-semibold text-ink">{permissions.length}</span> permissions</p>
          </div>
        )}
      </div>

      {/* ── Create/Edit Modal ──────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={closeModal}>
          <div className="w-full max-w-md rounded-2xl border border-surface-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-100">
              <div>
                <h3 className="text-lg font-semibold text-ink">{modalMode === 'create' ? 'Create Permission' : 'Edit Permission'}</h3>
                <p className="text-xs text-ink-muted mt-0.5">{modalMode === 'create' ? 'Define a new permission action.' : 'Update permission details.'}</p>
              </div>
              <button onClick={closeModal} disabled={saving} className="p-2 rounded-lg text-ink-muted hover:bg-surface-100 hover:text-ink transition-all disabled:opacity-50"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Permission Name *</label>
                <input type="text" value={form.name} onChange={(e) => handleFormChange('name', e.target.value)} placeholder="e.g. Create" className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Permission Key *</label>
                <input type="text" value={form.key} onChange={(e) => handleFormChange('key', e.target.value.toUpperCase())} placeholder="e.g. CREATE" className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all uppercase" />
                <p className="text-[10px] text-ink-muted mt-1">Keys are automatically converted to uppercase.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => handleFormChange('description', e.target.value)} placeholder="Optional description..." rows={3} className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
                <button type="button" onClick={closeModal} disabled={saving} className="px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm font-medium text-ink hover:bg-surface-50 transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-md shadow-amber-500/25 hover:shadow-lg transition-all disabled:opacity-70">
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {modalMode === 'create' ? 'Create' : 'Save'}
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
                <div><h3 className="text-base font-semibold text-ink">Delete Permission</h3><p className="text-xs text-ink-muted">This action cannot be undone.</p></div>
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
