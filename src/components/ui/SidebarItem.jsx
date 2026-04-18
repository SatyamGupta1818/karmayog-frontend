/**
 * SidebarItem.jsx
 *
 * Reusable sidebar navigation item.
 * Supports:
 * - Top-level links
 * - Nested collapsible menus (children)
 * - Active state detection
 * - Badges (text or number)
 * - Collapsed (icon-only) mode
 *
 * This component is purely presentational — it reads from navigationConfig
 * indirectly via the `item` prop passed down from Sidebar.jsx.
 */

import { useLocation, NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import * as Icons from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { toggleMenu, selectMenuOpen } from '../../store/slices/uiSlice'

export default function SidebarItem({ item, collapsed }) {
  const dispatch = useDispatch()
  const location = useLocation()
  const isMenuOpen = useSelector(selectMenuOpen(item.path))
  const hasChildren = item.children && item.children.length > 0

  // Resolve icon component from string name (e.g. "LayoutDashboard")
  const IconComponent = Icons[item.icon] ?? Icons.Circle

  // A parent item is "active" if any of its children match the current path
  const isParentActive = hasChildren &&
    item.children.some(child => location.pathname.startsWith(child.path))

  function handleParentClick() {
    if (hasChildren) {
      dispatch(toggleMenu(item.path))
    }
  }

  // ── Shared inner content ─────────────────────────────────
  const itemContent = (
    <>
      <span className="flex-shrink-0 relative">
        <IconComponent size={18} strokeWidth={1.75} />
      </span>

      {!collapsed && (
        <span className="flex-1 text-sm truncate animate-slide-in">
          {item.name}
        </span>
      )}

      {/* Badge */}
      {!collapsed && item.badge && (
        <span className={`
          text-[10px] font-semibold px-1.5 py-0.5 rounded-md
          ${typeof item.badge === 'number'
            ? 'bg-brand-500/20 text-brand-400'
            : 'bg-emerald-500/20 text-emerald-400'}
        `}>
          {item.badge}
        </span>
      )}

      {/* Chevron for parent items */}
      {!collapsed && hasChildren && (
        <ChevronDown
          size={14}
          className={`flex-shrink-0 text-ink-muted/60 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
        />
      )}
    </>
  )

  // ── Shared class builder ─────────────────────────────────
  const baseClasses = `
    flex items-center gap-3 w-full rounded-xl
    transition-all duration-150 group
   ${collapsed ? 'px-3 py-3.5 justify-center' : 'px-3 py-3.5'}
  `

  const activeClasses = 'bg-white/10 text-white nav-active-glow'
  const inactiveClasses = 'text-ink-muted hover:bg-white/5 hover:text-white/80'

  // ── Parent item (has children) ───────────────────────────
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={handleParentClick}
          title={collapsed ? item.name : undefined}
          className={`${baseClasses} ${isParentActive ? activeClasses : inactiveClasses}`}
        >
          {itemContent}
        </button>

        {/* Nested children — animate open/close */}
        <div
          className={`
            overflow-hidden transition-all duration-200 ease-in-out
            ${isMenuOpen && !collapsed ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="ml-4 pl-3 border-l border-white/10 mt-1 space-y-0.5 mb-1">
            {item.children.map(child => (
              <ChildItem key={child.path} child={child} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Leaf item (no children) ──────────────────────────────
  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.name : undefined}
      className={({ isActive }) =>
        `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
      }
    >
      {itemContent}
    </NavLink>
  )
}

/** Child nav link rendered inside a nested menu */
function ChildItem({ child }) {
  const IconComponent = child.icon ? (Icons[child.icon] ?? Icons.Dot) : Icons.Dot

  return (
    <NavLink
      to={child.path}
      className={({ isActive }) => `
        flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
        transition-all duration-150
        ${isActive
          ? 'text-brand-300 bg-white/5 font-medium'
          : 'text-ink-muted hover:text-white/80 hover:bg-white/5'}
      `}
    >
      <IconComponent size={14} strokeWidth={2} className="flex-shrink-0 opacity-70" />
      <span className="truncate">{child.name}</span>
    </NavLink>
  )
}
