/**
 * Navbar.jsx
 *
 * Top navigation bar with breadcrumb, search, and user actions.
 * Reads current route to display the page title dynamically.
 */

import { useLocation } from 'react-router-dom'
import { Search, Bell, Settings, ChevronRight } from 'lucide-react'
import { navigationConfig } from '../../config/navigationConfig'

/**
 * Derives a human-readable breadcrumb from the current pathname.
 * Automatically works for any route in navigationConfig.
 */
function useBreadcrumb() {
  const { pathname } = useLocation()
  const segments = pathname.replace(/^\//, '').split('/')

  // Flatten all items from config for lookup
  const allItems = navigationConfig.flatMap(g =>
    g.items.flatMap(item => [
      item,
      ...(item.children || []),
    ])
  )

  return segments.map((seg) => {
    const match = allItems.find(i => i.path.endsWith(`/${seg}`) || i.path === `/${seg}`)
    return match?.name ?? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
  })
}

export default function Navbar() {
  const breadcrumb = useBreadcrumb()
  const pageTitle  = breadcrumb[breadcrumb.length - 1]

  return (
    <header className="
      flex items-center justify-between
      h-16 px-6 flex-shrink-0
      bg-surface-50/80 glass-navbar
      border-b border-surface-200
    ">
      {/* ── Left: Breadcrumb ────────────────────────────── */}
      <div className="flex flex-col">
        {/* Breadcrumb trail */}
        <div className="flex items-center gap-1.5 text-xs text-ink-muted">
          <span>Home</span>
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="opacity-50" />
              <span className={i === breadcrumb.length - 1 ? 'text-ink font-medium' : ''}>
                {crumb}
              </span>
            </span>
          ))}
        </div>

        <h1 className="text-lg font-semibold text-ink leading-tight">
          {pageTitle}
        </h1>
      </div>

      {/* ── Right: Actions ──────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="
          flex items-center gap-2 px-3 py-2
          text-sm text-ink-muted
          bg-white border border-surface-200
          rounded-xl shadow-sm
          hover:border-surface-300 hover:text-ink
          transition-all duration-150
          group
        ">
          <Search size={15} className="flex-shrink-0" />
          <span className="hidden sm:block text-xs">Search...</span>
          <kbd className="hidden sm:block text-[10px] px-1.5 py-0.5 bg-surface-100 border border-surface-200 rounded text-ink-muted ml-1">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button className="
          relative w-9 h-9 flex items-center justify-center
          rounded-xl text-ink-muted
          hover:bg-surface-100 hover:text-ink
          transition-all duration-150
        ">
          <Bell size={18} />
          {/* Notification dot */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full border border-surface-50" />
        </button>

        {/* Settings */}
        <button className="
          w-9 h-9 flex items-center justify-center
          rounded-xl text-ink-muted
          hover:bg-surface-100 hover:text-ink
          transition-all duration-150
        ">
          <Settings size={18} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-surface-200 mx-1" />

        {/* Avatar */}
        <button className="
          flex items-center gap-2 p-1 pr-3
          rounded-xl
          hover:bg-surface-100
          transition-all duration-150
        ">
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=b6e3f4"
            alt="User"
            className="w-7 h-7 rounded-lg bg-surface-200 object-cover"
          />
          <span className="text-sm font-medium text-ink hidden sm:block">Alex</span>
        </button>
      </div>
    </header>
  )
}
