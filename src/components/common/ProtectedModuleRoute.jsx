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

export default function ProtectedModuleRoute({ moduleKey, children }) {
  const location = useLocation()
  const { canAccessPath, isSuperAdmin, rbacStatus } = usePermission()

  // While permissions are still loading, don't block — PermissionInitializer
  // handles the loading state at a higher level.
  if (rbacStatus !== 'succeeded') {
    return children
  }

  // SUPER_ADMIN bypasses all module checks
  if (isSuperAdmin) {
    return children
  }

  // No moduleKey configured — allow access (e.g., dashboard)
  if (!moduleKey) {
    return children
  }

  // Check if user has access to the current path
  const canRead = canAccessPath(location.pathname)

  if (!canRead) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />
  }

  return children
}
