/**
 * ============================================================
 * CENTRAL NAVIGATION CONFIG
 * ============================================================
 *
 * This is the single source of truth for sidebar navigation.
 *
 * HOW TO ADD A NEW TOP-LEVEL SECTION:
 * 1. Add a new entry to the array below with `name`, `path`, `icon`
 * 2. Create the corresponding page in /src/pages/<section>/index.jsx
 * 3. Add the route in /src/routes/routeConfig.js (with lazy import)
 * That's it! The sidebar will automatically render the new item.
 *
 * HOW TO ADD A NESTED TAB:
 * 1. Add `children` array to an existing entry (or create a new parent)
 * 2. Each child needs `name`, `path`
 * 3. Create the child page component
 * 4. Add the nested route in routeConfig.js
 *
 * ICON NAMES: Use lucide-react icon names (PascalCase string).
 * See: https://lucide.dev/icons
 *
 * BADGES: Add `badge: 'NEW'` or `badge: 12` to show a badge.
 * ============================================================
 */

export const navigationConfig = [
  // ── OVERVIEW ─────────────────────────────────────────────
  {
    section: 'Overview',
    items: [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        // badge: null — no badge for dashboard
      },
    ],
  },

  // ── WORK ─────────────────────────────────────────────────
  {
    section: 'Work',
    items: [
      {
        name: 'Workspace',
        path: '/workspace',
        icon: 'FolderKanban',
        // Children create a collapsible nested menu
        children: [
          { name: 'Projects', path: '/workspace/projects', icon: 'Folder' },
          { name: 'Epics', path: '/workspace/epics', icon: 'Zap' },
          { name: 'Stories', path: '/workspace/stories', icon: 'BookOpen' },
          { name: 'Tasks', path: '/workspace/tasks', icon: 'CheckSquare' },
        ],
      },
    ],
  },

  // ── PEOPLE ───────────────────────────────────────────────
  {
    section: 'People',
    items: [
      {
        name: 'Users',
        path: '/users',
        icon: 'Users',
        badge: 'NEW',
      },
      {
        name: 'Departments',
        path: '/departments',
        icon: 'Building2',
      },
    ],
  },

  // ── ADMINISTRATION ───────────────────────────────────────
  {
    section: 'Administration',
    items: [
      {
        name: 'Organizations',
        path: '/organizations',
        icon: 'Building2',
        superAdminOnly: true,
      },
      {
        name: 'Administrator',
        path: '/administrator',
        icon: 'FolderKanban',
        // Children create a collapsible nested menu
        children: [
          { name: 'Role Master', path: '/administrator/role-master', icon: 'Zap' },
          { name: 'Menu Master', path: '/administrator/menu-master', icon: 'Zap' },
          { name: 'Permission Master', path: '/administrator/permission-master', icon: 'Key' },
          { name: 'Settings', path: '/administrator/settings', icon: 'Settings' },
        ],
      },
    ],
  },

  /*
   * ── EXAMPLE: ADD A NEW SECTION ───────────────────────────
   * Uncomment the block below to add an "Analytics" section.
   * Then add the matching route in /src/routes/routeConfig.js.
   *
   * {
   *   section: 'Analytics',
   *   items: [
   *     {
   *       name: 'Reports',
   *       path: '/analytics/reports',
   *       icon: 'BarChart3',
   *     },
   *     {
   *       name: 'Insights',
   *       path: '/analytics/insights',
   *       icon: 'TrendingUp',
   *       badge: 'BETA',
   *     },
   *   ],
   * },
   */
]
