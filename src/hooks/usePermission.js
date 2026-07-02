/**
 * usePermission.js
 *
 * Centralized permission hook for the entire application.
 *
 * Usage:
 *   const { hasPermission, hasModuleAccess, isSuperAdmin } = usePermission()
 *
 *   // Check a specific action on a module:
 *   hasPermission('inventory.CREATE')   → true/false
 *   hasPermission('users.DELETE')       → true/false
 *
 *   // Check if user has ANY permission on a module:
 *   hasModuleAccess('inventory')        → true/false
 *
 *   // SUPER_ADMIN always returns true for all checks.
 */

import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  selectPermissionMap,
  selectRole,
  selectModules,
  selectAllowedPaths,
  selectRbacStatus,
} from '../store/slices/rbacSlice'

export default function usePermission() {
  const permissionMap = useSelector(selectPermissionMap)
  const role = useSelector(selectRole)
  const modules = useSelector(selectModules)
  const allowedPaths = useSelector(selectAllowedPaths)
  const rbacStatus = useSelector(selectRbacStatus)

  const normalizeKey = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const isSuperAdmin = [
    role?.name,
    role?.key,
    role?.role,
    role?.slug,
  ].some((value) => normalizeKey(value) === 'superadmin')

  /**
   * Check if the user has a specific permission.
   * @param {string} permString - Format: "moduleKey.ACTION" e.g. "inventory.CREATE"
   * @returns {boolean}
   */
  const hasPermission = useCallback(
    (permString) => {
      if (isSuperAdmin) return true
      if (!permString || typeof permString !== 'string') return false

      const dotIndex = permString.indexOf('.')
      if (dotIndex === -1) return false

      const moduleKey = permString.substring(0, dotIndex).toLowerCase()
      const action = permString.substring(dotIndex + 1).toUpperCase()

      let modulePermissions = permissionMap[moduleKey]
      
      // Fallback for singular/plural mismatches (e.g. 'projects' vs 'project')
      if (!modulePermissions) {
        const normalizedModuleKey = normalizeKey(moduleKey)
        const matchingKey = Object.keys(permissionMap).find(
          (k) => {
            const normalizedKey = normalizeKey(k)
            return moduleKey.startsWith(k)
              || k.startsWith(moduleKey)
              || normalizedModuleKey.startsWith(normalizedKey)
              || normalizedKey.startsWith(normalizedModuleKey)
              || normalizedModuleKey.endsWith(normalizedKey)
              || normalizedKey.endsWith(normalizedModuleKey)
          }
        )
        if (matchingKey) {
          modulePermissions = permissionMap[matchingKey]
        }
      }

      if (!modulePermissions) return false

      return modulePermissions.includes(action)
    },
    [permissionMap, isSuperAdmin]
  )

  /**
   * Check if the user has any permission on a module.
   * @param {string} moduleKey - e.g. "inventory", "users"
   * @returns {boolean}
   */
  const hasModuleAccess = useCallback(
    (moduleKey) => {
      if (isSuperAdmin) return true
      if (!moduleKey) return false
      const searchKey = moduleKey.toLowerCase()
      let perms = permissionMap[searchKey]
      const pathKey = searchKey.split('/').filter(Boolean).pop()

      // Fallback for singular/plural mismatches (e.g. 'projects' vs 'project')
      if (!perms) {
        const normalizedSearchKey = normalizeKey(searchKey)
        const matchingKey = Object.keys(permissionMap).find(
          (k) => {
            const normalizedKey = normalizeKey(k)
            return searchKey.startsWith(k)
              || k.startsWith(searchKey)
              || normalizedSearchKey.startsWith(normalizedKey)
              || normalizedKey.startsWith(normalizedSearchKey)
              || normalizedSearchKey.endsWith(normalizedKey)
              || normalizedKey.endsWith(normalizedSearchKey)
              || (pathKey && normalizeKey(pathKey) === normalizedKey)
          }
        )
        if (matchingKey) {
          perms = permissionMap[matchingKey]
        }
      }

      return Array.isArray(perms) && perms.length > 0
    },
    [permissionMap, isSuperAdmin]
  )

  /**
   * Check if the user can access a specific path.
   * @param {string} path - e.g. "/dashboard", "/users"
   * @returns {boolean}
   */
  const canAccessPath = useCallback(
    (path) => {
      if (isSuperAdmin) return true
      if (!path) return false
      return allowedPaths.some(
        (allowed) => path === allowed
          || path.startsWith(allowed + '/')
          || normalizeKey(path).endsWith(normalizeKey(allowed))
          || normalizeKey(allowed).endsWith(normalizeKey(path))
      )
    },
    [allowedPaths, isSuperAdmin]
  )

  return {
    hasPermission,
    hasModuleAccess,
    canAccessPath,
    isSuperAdmin,
    role,
    modules,
    allowedPaths,
    rbacStatus,
    permissionMap,
  }
}

export { usePermission }
