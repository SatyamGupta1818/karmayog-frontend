/**
 * PermissionGuard.jsx
 *
 * Declarative UI guard that conditionally renders children
 * based on the user's permissions.
 *
 * Usage:
 *   <PermissionGuard permission="inventory.CREATE">
 *     <button>Add Item</button>
 *   </PermissionGuard>
 *
 *   // With a fallback:
 *   <PermissionGuard permission="reports.READ" fallback={<UpgradePrompt />}>
 *     <ReportViewer />
 *   </PermissionGuard>
 *
 *   // Check module access (any permission):
 *   <PermissionGuard module="inventory">
 *     <InventorySection />
 *   </PermissionGuard>
 */

import usePermission from '../../hooks/usePermission'

export default function PermissionGuard({ permission, module, fallback = null, children }) {
  const { hasPermission, hasModuleAccess } = usePermission()

  // If a specific permission string is provided (e.g. "inventory.CREATE")
  if (permission) {
    return hasPermission(permission) ? children : fallback
  }

  // If only a module key is provided (e.g. "inventory")
  if (module) {
    return hasModuleAccess(module) ? children : fallback
  }

  // No guard specified — render children
  return children
}
