/**
 * rbacSlice.js
 *
 * Redux slice for Role-Based Access Control.
 *
 * Stores:
 *  - role:           The current user's role object
 *  - modules:        Raw modules array from the permission manifest
 *  - permissionMap:  Flattened lookup { moduleKey: ["CREATE","READ",...] }
 *  - allowedPaths:   Array of paths the user can navigate to
 *  - status/error:   Loading state for the async fetch
 *
 * The permissionMap uses a plain object for O(1) module key lookups.
 * Permission check within a module is O(n) on the actions array,
 * but since there are at most 4 actions (CRUD), this is effectively O(1).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import rbacService from '../../apis/services/rbac/rbac.service'

// ─── Async Thunk ──────────────────────────────────────────────────────────────

export const fetchPermissions = createAsyncThunk(
  'rbac/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await rbacService.fetchPermissionManifest()
      return data
    } catch (error) {
      const message =
        error?.response?.data?.message || error.message || 'Failed to fetch permissions'
      return rejectWithValue(message)
    }
  }
)

// ─── Helper: Build flattened permission map ───────────────────────────────────

function buildPermissionMap(modules) {
  const map = {}
  if (!modules || !Array.isArray(modules)) return map
  const getPathKey = (path) => String(path || '').split('/').filter(Boolean).pop() || ''

  modules.forEach((mod) => {
    const permSet = new Set()
    
    if (Array.isArray(mod.permissions)) {
      mod.permissions.forEach((p) => {
        if (p.key) permSet.add(p.key.toUpperCase())
        if (p.name) permSet.add(p.name.toUpperCase())
        if (p.permissionKey) permSet.add(p.permissionKey.toUpperCase())
      })
    }

    const permsArray = Array.from(permSet)

    if (mod.key) map[mod.key.toLowerCase()] = permsArray
    if (mod.name) map[mod.name.toLowerCase()] = permsArray
    if (mod.moduleKey) map[mod.moduleKey.toLowerCase()] = permsArray
    if (mod.path) map[mod.path.toLowerCase()] = permsArray
    if (getPathKey(mod.path)) map[getPathKey(mod.path).toLowerCase()] = permsArray
  })

  return map
}

function buildAllowedPaths(modules) {
  if (!modules || !Array.isArray(modules)) return []
  return modules.map((mod) => mod.path).filter(Boolean)
}

function isSuperAdminRole(role) {
  const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  return [role?.name, role?.key, role?.role, role?.slug].some((value) => normalize(value) === 'superadmin')
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  role: null,
  modules: [],
  permissionMap: {},    // { "inventory": ["CREATE","READ","UPDATE","DELETE"], ... }
  allowedPaths: [],     // ["/dashboard", "/users", ...]
  status: 'idle',       // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const rbacSlice = createSlice({
  name: 'rbac',
  initialState,
  reducers: {
    /**
     * Clear RBAC state (e.g., on logout).
     */
    clearRbac(state) {
      state.role = null
      state.modules = []
      state.permissionMap = {}
      state.allowedPaths = []
      state.status = 'idle'
      state.error = null
    },

    /**
     * Force-refresh the permission map from existing modules.
     * Useful after local mutations.
     */
    rebuildPermissionMap(state) {
      state.permissionMap = buildPermissionMap(state.modules)
      state.allowedPaths = buildAllowedPaths(state.modules)
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        const { role, modules } = action.payload || {}
        state.role = role || null
        state.modules = modules || []
        state.permissionMap = buildPermissionMap(modules)
        state.allowedPaths = buildAllowedPaths(modules)
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Unknown error'
      })
  },
})

// ─── Actions ──────────────────────────────────────────────────────────────────

export const { clearRbac, rebuildPermissionMap } = rbacSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectRole = (state) => state.rbac.role
export const selectModules = (state) => state.rbac.modules
export const selectPermissionMap = (state) => state.rbac.permissionMap
export const selectAllowedPaths = (state) => state.rbac.allowedPaths
export const selectRbacStatus = (state) => state.rbac.status
export const selectRbacError = (state) => state.rbac.error
export const selectIsSuperAdmin = (state) => isSuperAdminRole(state.rbac.role)

export default rbacSlice.reducer
