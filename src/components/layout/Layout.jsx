/**
 * Layout.jsx
 *
 * Root layout that composes Sidebar + Navbar + Content area.
 * All protected pages are rendered inside <Outlet />.
 */

import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { selectSidebarCollapsed } from '../../store/slices/uiSlice'
import { ToastContainer } from '../common/Toast'

export default function Layout() {
  const collapsed = useSelector(selectSidebarCollapsed)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <Sidebar />

      {/* ── Right side: Navbar + Content ────────────────── */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
      >
        <Navbar />

        {/* ── Main Content ──────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Toast Notifications ─────────────────────────── */}
      <ToastContainer />
    </div>
  )
}

