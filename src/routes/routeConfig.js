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
const Settings = lazy(() => import('../pages/administrator/settings'))

// ── Route Configuration ────────────────────────────────────
export const routeConfig = [
  {
    path: 'dashboard',
    element: Dashboard,
  },
  {
    path: 'projects',
    element: ProjectsIndex,
    // Nested child routes rendered inside ProjectsIndex via <Outlet>
    children: [
      { path: 'tasks', element: Tasks },
      { path: 'epics', element: Epics },
      { path: 'stories', element: Stories },
    ],
  },
  {
    path: 'users',
    element: Users,
  },
  {
    path: 'departments',
    element: Departments,
  },
  {
    path: 'administrator',
    element: AdministrationIndex,
    // Nested child routes rendered inside ProjectsIndex via <Outlet>
    children: [
      { path: 'settings', element: Settings },
      { path: 'role-master', element: RoleMaster },
      { path: 'menu-master', element: MenuMaster },
    ],
  },


  /*
   * ── EXAMPLE: ADD A NEW ROUTE ─────────────────────────────
   * const Reports  = lazy(() => import('../pages/analytics/Reports'))
   * const Insights = lazy(() => import('../pages/analytics/Insights'))
   *
   * {
   *   path: 'analytics',
   *   children: [
   *     { path: 'reports',  element: Reports },
   *     { path: 'insights', element: Insights },
   *   ],
   * },
   */
]
