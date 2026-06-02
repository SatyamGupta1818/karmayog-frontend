/**
 * Sidebar.jsx
 *
 * Fully redesigned collapsible sidebar with a modern, premium SaaS UI.
 *
 * Navigation is now DYNAMIC:
 *  - If RBAC modules are loaded from the API, sidebar items are built
 *    from the user's allowed modules.
 *  - SUPER_ADMIN sees all items from navigationConfig as a fallback.
 *  - Uses the user's real name & role from the auth/rbac stores.
 */

import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSidebar, selectSidebarCollapsed } from '../../store/slices/uiSlice'
import { selectCurrentUser } from '../../store/slices/authSlice'
import { selectModules, selectRole } from '../../store/slices/rbacSlice'
import { navigationConfig } from '../../config/navigationConfig'
import usePermission from '../../hooks/usePermission'
import SidebarItem from '../ui/SidebarItem'
import { PanelLeftClose, PanelLeftOpen, Hexagon, Sparkles, Building2 } from 'lucide-react'
import { getOrganizationDetails, getUserDisplayDetails } from '../../utils/session'

/**
 * Build dynamic navigation structure from RBAC modules.
 * Groups modules into sections based on parentId relationships.
 */
function buildDynamicNav(modules) {
  if (!modules || modules.length === 0) return []

  // Separate parent modules (no parentId) from children
  const parents = modules.filter((m) => !m.parentId).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  const childrenMap = {}

  modules.forEach((m) => {
    if (m.parentId) {
      if (!childrenMap[m.parentId]) childrenMap[m.parentId] = []
      childrenMap[m.parentId].push(m)
    }
  })

  // Sort children by sortOrder
  Object.values(childrenMap).forEach((arr) => arr.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)))

  // Build nav items
  const items = parents.map((mod) => {
    const children = childrenMap[mod.id]
    const navItem = {
      name: mod.name,
      path: mod.path.startsWith('/') ? mod.path : `/${mod.path}`,
      icon: mod.icon || 'Circle',
    }
    if (children && children.length > 0) {
      navItem.children = children.map((child) => ({
        name: child.name,
        path: child.path.startsWith('/') ? child.path : `/${child.path}`,
        icon: child.icon || 'Dot',
      }))
    }
    return navItem
  })

  // Return as a single section (API-driven menus don't have static sections)
  return [{ section: 'Menu', items }]
}

/**
 * Filter the static navigationConfig to only show items the user has access to.
 */
function filterNavByPermission(navConfig, modules, isSuperAdmin) {
  if (isSuperAdmin) return navConfig

  // Build a set of allowed module keys for O(1) lookup
  const allowedKeys = new Set(
    modules.flatMap((m) => [
      (m.key || '').toLowerCase(),
      (m.name || '').toLowerCase(),
      (m.moduleKey || '').toLowerCase()
    ]).filter(Boolean)
  )

  const hasAccess = (moduleKey) => {
    if (!moduleKey) return false
    
    // Check exact match
    if (allowedKeys.has(moduleKey.toLowerCase())) return true

    // Fallback: Check if moduleKey starts with or matches plural/singular variants
    // e.g. "projects" matches "project" in allowedKeys
    for (const key of allowedKeys) {
      if (moduleKey.toLowerCase().startsWith(key) || key.startsWith(moduleKey.toLowerCase())) {
        return true
      }
    }
    
    return false
  }

  return navConfig
    .map((group) => {
      const filteredItems = group.items
        .map((item) => {
          if (item.superAdminOnly) return null

          // Extract moduleKey fallback (e.g., "/users" → "users")
          const itemKey = item.moduleKey || item.path.replace(/^\//, '').split('/')[0]

          // If item has children, filter children first
          if (item.children && item.children.length > 0) {
            const filteredChildren = item.children.filter((child) => {
              if (child.superAdminOnly) return false

              const childKey = child.moduleKey || child.path.replace(/^\//, '').split('/').pop()
              return hasAccess(childKey)
            })

            // Keep parent if it has accessible children
            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren }
            }
            return null
          }

          // Leaf item — check access
          return hasAccess(itemKey) ? item : null
        })
        .filter(Boolean)

      if (filteredItems.length === 0) return null
      return { ...group, items: filteredItems }
    })
    .filter(Boolean)
}

export default function Sidebar() {
  const dispatch = useDispatch()
  const collapsed = useSelector(selectSidebarCollapsed)
  const user = useSelector(selectCurrentUser)
  const role = useSelector(selectRole)
  const modules = useSelector(selectModules)
  const { isSuperAdmin } = usePermission()

  // Build navigation: filter static navigationConfig by user's actual allowed modules
  const navSections = useMemo(() => {
    if (isSuperAdmin) {
      return navigationConfig
    }
    return filterNavByPermission(navigationConfig, modules || [], false)
  }, [modules, isSuperAdmin])

  // User display info
  const { displayName: userName, email: userEmail } = getUserDisplayDetails(user)
  const organization = getOrganizationDetails(user)
  const userRole = role?.name
    ? role.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Member'
  const avatarSeed = encodeURIComponent(userEmail || userName || 'User')

  return (
    <aside
      className={`
        relative flex flex-col h-full z-30 flex-shrink-0
        transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        bg-gradient-to-b from-[#060d1f] to-[#030712]
        border-r border-white/[0.05] shadow-[4px_0_24px_rgba(0,0,0,0.2)]
        ${collapsed ? 'w-[80px]' : 'w-[280px]'}
      `}
    >
      {/* ── Background Glow Effects ───────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-32 bg-amber-500/[0.03] blur-3xl pointer-events-none" />

      {/* ── Brand / Logo Area ─────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 h-20 flex-shrink-0 relative">
        {/* Subtle bottom border gradient */}
        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
        
        <div className="relative flex items-center justify-center w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-600/20 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <Hexagon className="text-amber-500" size={22} strokeWidth={2} />
        </div>
        
        {!collapsed && (
          <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="font-['Sora'] font-black tracking-tight text-lg leading-none">
              <span className="text-white">KARMA</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">YOG</span>
            </span>
            <span className="text-[10px] font-medium text-white/40 tracking-widest uppercase mt-1">
              powered by STACKTECH
            </span>
          </div>
        )}
      </div>

      {/* ── User Profile Card ─────────────────────────────── */}
      <div className={`px-4 pt-6 pb-2 flex-shrink-0 transition-all duration-300`}>
        <div 
          className={`
            relative flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] 
            backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04] cursor-pointer
            ${collapsed ? 'p-2 justify-center' : 'p-3 shadow-lg shadow-black/20'}
          `}
        >
          <div className="relative flex-shrink-0">
            <img
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}&backgroundColor=b6e3f4`}
              alt={userName}
              className="w-10 h-10 rounded-xl bg-slate-800 object-cover ring-2 ring-white/10 shadow-md"
            />
            {/* Premium Online indicator */}
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-[2.5px] border-[#060d1f]" />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1 animate-in fade-in duration-300">
              <p className="text-sm font-bold text-white truncate">
                {userName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Sparkles size={10} className="text-amber-500" />
                <p className="text-[11px] font-medium text-white/50 truncate">
                  {userRole}
                </p>
              </div>
              {organization?.name && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Building2 size={10} className="text-amber-500" />
                  <p className="text-[11px] font-medium text-white/55 truncate">
                    {organization.name}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      {/* [&::-webkit-scrollbar]:hidden hides the scrollbar for a cleaner UI but keeps it scrollable */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {navSections.map((group, groupIndex) => (
          <div key={group.section} className="flex flex-col gap-1">
            
            {/* Section Header */}
            {!collapsed ? (
              <div className="flex items-center gap-3 px-3 mb-2 animate-in fade-in duration-300">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 select-none">
                  {group.section}
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
            ) : (
              groupIndex > 0 && (
                <div className="h-px w-8 mx-auto my-2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              )
            )}

            {/* Section Items */}
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.path}
                  item={item}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer / Collapse Toggle ──────────────────────── */}
      <div className="flex-shrink-0 p-4 border-t border-white/[0.05] bg-white/[0.01]">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={`
            flex items-center gap-3 w-full rounded-xl p-3
            text-white/40 hover:text-white hover:bg-white/[0.05]
            border border-transparent hover:border-white/[0.05]
            transition-all duration-200 group relative overflow-hidden
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {/* Subtle hover background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.02] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          
          <div className="relative z-10 flex items-center justify-center">
            {collapsed ? (
              <PanelLeftOpen size={20} className="group-hover:scale-110 group-hover:text-amber-500 transition-all duration-200" />
            ) : (
              <PanelLeftClose size={20} className="group-hover:scale-110 group-hover:text-amber-500 transition-all duration-200" />
            )}
          </div>

          {!collapsed && (
            <span className="text-[13px] font-semibold tracking-wide relative z-10 animate-in fade-in duration-200">
              Collapse View
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
