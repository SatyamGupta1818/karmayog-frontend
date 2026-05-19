/**
 * ============================================================
 * CENTRAL ROUTE CONFIG
 * ============================================================
 *
 * All routes are defined here with React.lazy() for code splitting.
 *
 * HOW TO ADD A NEW ROUTE:
 * 1. Create your page component in /src/pages/
 * 2. Add a lazy import below
 * 3. Add an entry to `routeConfig` array
 * Routes are automatically picked up by AppRoutes.jsx.
 *
 * `moduleKey` is used by ProtectedModuleRoute to check if the
 * user has READ permission for this module. If omitted, the
 * route is accessible to all authenticated users.
 *
 * `index: true` marks a route as the default child of a parent.
 * ============================================================
 */

import { lazy } from 'react'

// ── Page Imports (lazy-loaded for code splitting) ──────────
const Dashboard = lazy(() => import('../pages/dashboard'))
const ProjectsIndex = lazy(() => import('../pages/projects'))
const AdministrationIndex = lazy(() => import('../pages/administrator'))
const Tasks = lazy(() => import('../pages/projects/Tasks'))
const Epics = lazy(() => import('../pages/projects/Epics'))
const Stories = lazy(() => import('../pages/projects/Stories'))
const Users = lazy(() => import('../pages/users'))
const Departments = lazy(() => import('../pages/departments'))
const RoleMaster = lazy(() => import('../pages/administrator/rolemaster'))
const MenuMaster = lazy(() => import('../pages/administrator/menumaster'))
const PermissionMaster = lazy(() => import('../pages/administrator/permissionmaster'))
const Settings = lazy(() => import('../pages/administrator/settings'))

// ── Route Configuration ────────────────────────────────────
export const routeConfig = [
  {
    path: 'dashboard',
    element: Dashboard,
    moduleKey: 'dashboard',
  },
  {
    path: 'projects',
    element: ProjectsIndex,
    moduleKey: 'projects',
    // Nested child routes rendered inside ProjectsIndex via <Outlet>
    children: [
      { path: 'tasks', element: Tasks, moduleKey: 'projects' },
      { path: 'epics', element: Epics, moduleKey: 'projects' },
      { path: 'stories', element: Stories, moduleKey: 'projects' },
    ],
  },
  {
    path: 'users',
    element: Users,
    moduleKey: 'users',
  },
  {
    path: 'departments',
    element: Departments,
    moduleKey: 'departments',
  },
  {
    path: 'administrator',
    element: AdministrationIndex,
    moduleKey: 'administrator',
    // Nested child routes rendered inside AdministrationIndex via <Outlet>
    children: [
      { path: 'settings', element: Settings, moduleKey: 'administrator' },
      { path: 'role-master', element: RoleMaster, moduleKey: 'role-master' },
      { path: 'menu-master', element: MenuMaster, moduleKey: 'menu-master' },
      { path: 'permission-master', element: PermissionMaster, moduleKey: 'permission-master' },
    ],
  },


  /*
   * ── EXAMPLE: ADD A NEW ROUTE ─────────────────────────────
   * const Reports  = lazy(() => import('../pages/analytics/Reports'))
   * const Insights = lazy(() => import('../pages/analytics/Insights'))
   *
   * {
   *   path: 'analytics',
   *   moduleKey: 'analytics',
   *   children: [
   *     { path: 'reports',  element: Reports,  moduleKey: 'analytics' },
   *     { path: 'insights', element: Insights, moduleKey: 'analytics' },
   *   ],
   * },
   */
]
