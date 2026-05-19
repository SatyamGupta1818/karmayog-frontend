import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Loader2,
  LogOut,
  Search,
  Settings,
  UserCircle,
  X,
} from 'lucide-react'
import { navigationConfig } from '../../config/navigationConfig'
import useAuth from '../../hooks/useAuth'

function useBreadcrumb() {
  const { pathname } = useLocation()
  const segments = pathname.replace(/^\//, '').split('/')

  const allItems = navigationConfig.flatMap((group) =>
    group.items.flatMap((item) => [
      item,
      ...(item.children || []),
    ])
  )

  return segments.map((segment) => {
    const match = allItems.find(
      (item) => item.path.endsWith(`/${segment}`) || item.path === `/${segment}`
    )

    return match?.name ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
  })
}

function getUserDetails(authUser) {
  try {
    const storedUsers = localStorage.getItem('users');
    let userData = storedUsers ? JSON.parse(storedUsers) : null;

    // Handle case where 'users' might be an array
    if (Array.isArray(userData)) {
      // Try to find the matching user by email from useAuth, or fallback to the first user
      userData = authUser?.email 
        ? userData.find((u) => u.email === authUser.email) || userData[0] 
        : userData[0];
    }

    // Safely extract firstName, lastName, and email with fallbacks
    const firstName = userData?.firstName || authUser?.firstName || '';
    const lastName = userData?.lastName || authUser?.lastName || '';
    const email = userData?.email || authUser?.email || '';

    const fullName = `${firstName} ${lastName}`.trim();

    return {
      displayName: fullName || 'Unknown User',
      email: email
    };
  } catch (error) {
    console.error('Error parsing user data from localStorage', error);
    return {
      displayName: 'Unknown User',
      email: authUser?.email || ''
    };
  }
}

function getAvatarSeed(value) {
  return encodeURIComponent(value || 'User')
}

export default function Navbar() {
  const breadcrumb = useBreadcrumb()
  const pageTitle = breadcrumb[breadcrumb.length - 1]
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const { user, logout } = useAuth()

  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Safely grab user details
  const { displayName: userName, email: userEmail } = getUserDetails(user)
  const avatarSeed = getAvatarSeed(userEmail || userName)

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const openLogoutConfirm = () => {
    setMenuOpen(false)
    setConfirmOpen(true)
  }

  const closeLogoutConfirm = () => {
    if (!loggingOut) {
      setConfirmOpen(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)

    try {
      await logout()
    } catch (error) {
      console.error('Logout failed on server, local session was cleared.', error)
    } finally {
      navigate('/login', { replace: true })
      setLoggingOut(false)
      setConfirmOpen(false)
    }
  }

  return (
    <>
      <header className="
        relative z-30
        flex h-16 flex-shrink-0 items-center justify-between
        border-b border-surface-200
        bg-surface-50/80 px-6 glass-navbar
      ">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span>Home</span>
            {breadcrumb.map((crumb, index) => (
              <span key={`${crumb}-${index}`} className="flex items-center gap-1.5">
                <ChevronRight size={12} className="opacity-50" />
                <span className={index === breadcrumb.length - 1 ? 'font-medium text-ink' : ''}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>

          <h1 className="text-lg font-semibold leading-tight text-ink">
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="
              flex items-center gap-2 rounded-xl
              border border-surface-200 bg-white px-3 py-2
              text-sm text-ink-muted shadow-sm
              transition-all duration-150
              hover:border-surface-300 hover:text-ink
            "
          >
            <Search size={15} className="flex-shrink-0" />
            <span className="hidden text-xs sm:block">Search...</span>
            <kbd className="ml-1 hidden rounded border border-surface-200 bg-surface-100 px-1.5 py-0.5 text-[10px] text-ink-muted sm:block">
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            className="
              relative flex h-9 w-9 items-center justify-center
              rounded-xl text-ink-muted
              transition-all duration-150
              hover:bg-surface-100 hover:text-ink
            "
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-surface-50 bg-brand-500" />
          </button>

          <button
            type="button"
            className="
              flex h-9 w-9 items-center justify-center
              rounded-xl text-ink-muted
              transition-all duration-150
              hover:bg-surface-100 hover:text-ink
            "
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>

          <div className="mx-1 h-6 w-px bg-surface-200" />

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="
                flex items-center gap-2 rounded-xl
                p-1 pr-2 transition-all duration-150
                hover:bg-surface-100
              "
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}&backgroundColor=b6e3f4`}
                alt={userName}
                className="h-7 w-7 rounded-lg bg-surface-200 object-cover"
              />
              <span className="hidden max-w-32 truncate text-sm font-medium text-ink sm:block">
                {userName}
              </span>
              <ChevronDown
                size={15}
                className={`text-ink-muted transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="
                  absolute right-0 top-11 w-64 overflow-hidden
                  rounded-xl border border-surface-200
                  bg-white shadow-xl shadow-surface-900/10
                "
              >
                <div className="border-b border-surface-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-100 text-ink-muted">
                      <UserCircle size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{userName}</p>
                      {userEmail && (
                        <p className="truncate text-xs text-ink-muted">{userEmail}</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={openLogoutConfirm}
                  className="
                    flex w-full items-center gap-3 px-4 py-3
                    text-sm font-medium text-red-600
                    transition-colors duration-150
                    hover:bg-red-50
                  "
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {confirmOpen && (
        <div
          className="
            fixed inset-0 z-50 flex items-center justify-center
            bg-ink/40 px-4
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div className="
            w-full max-w-sm rounded-xl border border-surface-200
            bg-white shadow-2xl shadow-surface-900/20
          ">
            <div className="flex items-start justify-between gap-4 px-5 pt-5">
              <div>
                <h2 id="logout-title" className="text-base font-semibold text-ink">
                  Logout?
                </h2>
                <p className="mt-1 text-sm leading-5 text-ink-muted">
                  You will need to sign in again to access your dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={closeLogoutConfirm}
                disabled={loggingOut}
                className="
                  flex h-8 w-8 items-center justify-center
                  rounded-lg text-ink-muted
                  transition-colors duration-150
                  hover:bg-surface-100 hover:text-ink
                  disabled:opacity-50
                "
                aria-label="Close logout confirmation"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex justify-end gap-2 px-5 py-5">
              <button
                type="button"
                onClick={closeLogoutConfirm}
                disabled={loggingOut}
                className="
                  rounded-lg border border-surface-200 bg-white
                  px-4 py-2 text-sm font-medium text-ink
                  transition-colors duration-150
                  hover:bg-surface-50
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="
                  flex items-center gap-2 rounded-lg
                  bg-red-600 px-4 py-2
                  text-sm font-semibold text-white
                  transition-colors duration-150
                  hover:bg-red-700
                  disabled:opacity-70
                "
              >
                {loggingOut && <Loader2 size={15} className="animate-spin" />}
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}