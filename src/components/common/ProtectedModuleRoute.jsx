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
  const { hasModuleAccess, isSuperAdmin, rbacStatus } = usePermission()

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
  const hasAccess = hasModuleAccess(moduleKey)

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />
  }

  return children
}
