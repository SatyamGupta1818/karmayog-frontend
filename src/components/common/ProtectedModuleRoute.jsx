/**
 * ProtectedModuleRoute.jsx
 *
 * HOC wrapper for route-level permission checking.
 * Reads the `moduleKey` from routeConfig and verifies the user has
 * at least READ access. If not, redirects to /unauthorized.
 *
 * Used in AppRoutes.jsx to wrap each protected route element.
 */

import { Navigate, useLocation } from 'react-router-dom'
import usePermission from '../../hooks/usePermission'

export default function ProtectedModuleRoute({ moduleKey, superAdminOnly = false, children }) {
  const location = useLocation()
  const { modules, isSuperAdmin, rbacStatus } = usePermission()

  // While permissions are still loading, don't block — PermissionInitializer
  // handles the loading state at a higher level.
  if (rbacStatus !== 'succeeded') {
    return children
  }

  // SUPER_ADMIN bypasses all module checks
  if (isSuperAdmin) {
    return children
  }

  if (superAdminOnly) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />
  }

  // No moduleKey configured — allow access
  if (!moduleKey) {
    return children
  }

  // Check if user has access to the current module
  // 1. Check if the module key perfectly matches a DB module key
  let hasAccess = modules.some((m) => m.key === moduleKey)

  // 2. Fallback: Check if the exact path matches a DB module path.
  // This handles cases where the DB module key (e.g. 'roleMaster') doesn't exactly match
  // the routeConfig moduleKey (e.g. 'role-master'), but the module was legitimately 
  // returned by the API (and thus its exact path is in the allowed modules).
  if (!hasAccess) {
    const currentPath = location.pathname.replace(/\/$/, '') || '/'
    hasAccess = modules.some((m) => {
      const modPath = (m.path.startsWith('/') ? m.path : `/${m.path}`).replace(/\/$/, '') || '/'
      return currentPath === modPath
    })
  }

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />
  }

  return children
}
