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
const ProjectDetails = lazy(() => import('../pages/projects/ProjectDetails'))
const AdministrationIndex = lazy(() => import('../pages/administrator'))
const Features = lazy(() => import('../pages/workspace/Features'))
const FeatureDetails = lazy(() => import('../pages/workspace/FeatureDetails'))
const Tasks = lazy(() => import('../pages/workspace/Tasks'))
const TaskDetails = lazy(() => import('../pages/workspace/TaskDetails'))
const Issues = lazy(() => import('../pages/workspace/Issues'))
const IssueDetails = lazy(() => import('../pages/workspace/IssueDetails'))
const Comments = lazy(() => import('../pages/workspace/Comments'))
const KanbanBoard = lazy(() => import('../pages/workspace/KanbanBoard'))
const WorkTimesheet = lazy(() => import('../pages/workspace/WorkTimesheet'))
const Users = lazy(() => import('../pages/users'))
const Departments = lazy(() => import('../pages/departments'))
const Organizations = lazy(() => import('../pages/organizations'))
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
    path: 'workspace',
    moduleKey: 'projects',
    children: [
      {
        path: 'projects',
        element: ProjectsIndex,
        moduleKey: 'projects',
        children: [
          // Use a stable 'details' path and read the project id via query params
          { path: 'details', element: ProjectDetails, moduleKey: 'projects' },
        ],
      },
      {
        path: 'features',
        element: Features,
        moduleKey: 'features',
        children: [
          { path: 'details', element: FeatureDetails, moduleKey: 'features' },
        ],
      },
      {
        path: 'tasks',
        element: Tasks,
        moduleKey: 'tasks',
        children: [
          { path: 'details', element: TaskDetails, moduleKey: 'tasks' },
        ],
      },
      {
        path: 'issues',
        element: Issues,
        moduleKey: 'issues',
        children: [
          { path: 'details', element: IssueDetails, moduleKey: 'issues' },
        ],
      },
      { path: 'comments', element: Comments, moduleKey: 'comments' },
      { path: 'kanban', element: KanbanBoard, moduleKey: 'kanban' },
      { path: 'timesheet', element: WorkTimesheet, moduleKey: 'work-timesheet' },
      { path: 'work-timesheet', element: WorkTimesheet, moduleKey: 'work-timesheet' },
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
    path: 'organizations',
    element: Organizations,
    moduleKey: 'organizations',
    superAdminOnly: true,
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
