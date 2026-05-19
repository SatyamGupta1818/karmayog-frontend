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

  const isSuperAdmin = role?.name === 'SUPER_ADMIN'

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

      const moduleKey = permString.substring(0, dotIndex)
      const action = permString.substring(dotIndex + 1)

      const modulePermissions = permissionMap[moduleKey]
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
      const perms = permissionMap[moduleKey]
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
        (allowed) => path === allowed || path.startsWith(allowed + '/')
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
