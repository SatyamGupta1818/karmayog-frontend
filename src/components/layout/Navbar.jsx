import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  Bell,
  Building2,
  Check,
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
import usePermission from '../../hooks/usePermission'
import organizationService from '../../apis/services/organization/organization.service'
import { toast } from '../common/Toast'
import { fetchPermissions, clearRbac } from '../../store/slices/rbacSlice'
import { setCredentials } from '../../store/slices/authSlice'
import {
  getOrganizationDetails,
  getUserDisplayDetails,
  normalizeOrganization,
} from '../../utils/session'

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

function getAvatarSeed(value) {
  return encodeURIComponent(value || 'User')
}

function extractList(response, resourceKey) {
  if (Array.isArray(response)) return response

  const candidates = [
    response?.[resourceKey],
    response?.data,
    response?.items,
    response?.results,
    response?.rows,
    response?.data?.[resourceKey],
    response?.data?.data,
    response?.data?.items,
    response?.data?.results,
    response?.data?.rows,
  ]

  return candidates.find(Array.isArray) || []
}

function extractEntity(response, resourceKey) {
  const candidates = [
    response?.[resourceKey],
    response?.data?.[resourceKey],
    response?.data?.data,
    response?.data,
    response,
  ]

  return candidates.find((candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate)) || null
}

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.response?.data?.error || error?.message
  return Array.isArray(message) ? message.join(', ') : message || fallback
}

function getSwitchPayload(response) {
  const payload = response?.data || response || {}
  return {
    accessToken: payload.accessToken || payload.tokens?.accessToken,
    refreshToken: payload.refreshToken || payload.tokens?.refreshToken,
    user: payload.user || payload.currentUser,
    organization: payload.organization || payload.activeOrganization || payload.org,
  }
}

export default function Navbar() {
  const breadcrumb = useBreadcrumb()
  const pageTitle = breadcrumb[breadcrumb.length - 1]
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const menuRef = useRef(null)
  const orgRef = useRef(null)
  const { user, logout } = useAuth()
  const { isSuperAdmin } = usePermission()

  const [menuOpen, setMenuOpen] = useState(false)
  const [orgMenuOpen, setOrgMenuOpen] = useState(false)
  const [organizations, setOrganizations] = useState([])
  const [currentOrg, setCurrentOrg] = useState(() => getOrganizationDetails(user))
  const [orgLoading, setOrgLoading] = useState(false)
  const [switchingOrgId, setSwitchingOrgId] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Safely grab user details
  const { displayName: userName, email: userEmail } = getUserDisplayDetails(user)
  const avatarSeed = getAvatarSeed(userEmail || userName)

  const loadCurrentOrganization = useCallback(async () => {
    try {
      const response = await organizationService.getCurrent()
      const organization = normalizeOrganization(extractEntity(response, 'organization'))
      if (organization?.name) {
        localStorage.setItem('organization', JSON.stringify(organization.raw || organization))
        setCurrentOrg(organization)
      }
    } catch {
      setCurrentOrg(getOrganizationDetails(user))
    }
  }, [user])

  const loadOrganizations = useCallback(async () => {
    if (!isSuperAdmin) return

    try {
      setOrgLoading(true)
      const response = await organizationService.list({
        page: 1,
        limit: 100,
        sortBy: 'organizationName',
        sortOrder: 'ASC',
      })
      const normalized = extractList(response, 'organizations')
        .map(normalizeOrganization)
        .filter((organization) => organization?.id && organization?.name)

      setOrganizations(normalized)
    } catch (error) {
      toast.error('Failed to load organizations', getErrorMessage(error, 'Failed to load organizations.'))
    } finally {
      setOrgLoading(false)
    }
  }, [isSuperAdmin])

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
      if (orgRef.current && !orgRef.current.contains(event.target)) {
        setOrgMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    setCurrentOrg(getOrganizationDetails(user))
    loadCurrentOrganization()
  }, [loadCurrentOrganization, user])

  useEffect(() => {
    const handleOrganizationSwitch = (event) => {
      const organization = normalizeOrganization(event.detail)
      if (organization?.name) {
        setCurrentOrg(organization)
      }
    }

    window.addEventListener('organization:switch', handleOrganizationSwitch)
    return () => window.removeEventListener('organization:switch', handleOrganizationSwitch)
  }, [])

  const openLogoutConfirm = () => {
    setMenuOpen(false)
    setConfirmOpen(true)
  }

  const toggleOrganizationMenu = async () => {
    if (!isSuperAdmin) return

    const willOpen = !orgMenuOpen
    setOrgMenuOpen(willOpen)
    setMenuOpen(false)

    if (willOpen && organizations.length === 0) {
      await loadOrganizations()
    }
  }

  const handleSwitchOrganization = async (organization) => {
    if (!organization?.id || organization.id === currentOrg?.id) {
      setOrgMenuOpen(false)
      return
    }

    setSwitchingOrgId(organization.id)

    try {
      const response = await organizationService.switchOrganization(organization.id)
      const payload = getSwitchPayload(response)
      const nextOrganization = normalizeOrganization(payload.organization) || organization

      if (payload.accessToken || payload.refreshToken || payload.user) {
        dispatch(setCredentials({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user,
        }))
      }

      localStorage.setItem('organization', JSON.stringify(nextOrganization.raw || nextOrganization))
      setCurrentOrg(nextOrganization)
      setOrgMenuOpen(false)
      dispatch(clearRbac())
      dispatch(fetchPermissions())
      toast.success('Organization Switched', `Now working in "${nextOrganization.name}".`)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error('Switch Failed', getErrorMessage(error, 'Failed to switch organization.'))
    } finally {
      setSwitchingOrgId(null)
    }
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
          <div ref={orgRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={toggleOrganizationMenu}
              disabled={!isSuperAdmin}
              className={`
                flex max-w-[240px] items-center gap-2 rounded-xl
                border border-surface-200 bg-white px-3 py-2
                text-sm shadow-sm transition-all duration-150
                ${isSuperAdmin ? 'text-ink-muted hover:border-surface-300 hover:text-ink' : 'cursor-default text-ink'}
              `}
              title={isSuperAdmin ? 'Switch organization' : currentOrg?.name}
            >
              <Building2 size={15} className="flex-shrink-0 text-amber-500" />
              <span className="truncate text-xs font-semibold">
                {currentOrg?.name || 'Organization'}
              </span>
              {isSuperAdmin && (
                <ChevronDown
                  size={14}
                  className={`flex-shrink-0 text-ink-muted transition-transform duration-150 ${orgMenuOpen ? 'rotate-180' : ''}`}
                />
              )}
            </button>

            {isSuperAdmin && orgMenuOpen && (
              <div
                role="menu"
                className="
                  absolute right-0 top-11 w-80 overflow-hidden
                  rounded-xl border border-surface-200
                  bg-white shadow-xl shadow-surface-900/10
                "
              >
                <div className="border-b border-surface-100 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Switch Organization
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-ink">
                    {currentOrg?.name || 'Current organization'}
                  </p>
                </div>

                <div className="max-h-72 overflow-y-auto py-1">
                  {orgLoading ? (
                    <div className="flex items-center gap-2 px-4 py-4 text-sm text-ink-muted">
                      <Loader2 size={15} className="animate-spin text-amber-500" />
                      Loading organizations...
                    </div>
                  ) : organizations.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-ink-muted">
                      No organizations available.
                    </div>
                  ) : (
                    organizations.map((organization) => {
                      const active = organization.id === currentOrg?.id
                      const switching = switchingOrgId === organization.id

                      return (
                        <button
                          type="button"
                          role="menuitem"
                          key={organization.id}
                          onClick={() => handleSwitchOrganization(organization)}
                          disabled={switchingOrgId !== null}
                          className={`
                            flex w-full items-center gap-3 px-4 py-3
                            text-left text-sm transition-colors duration-150
                            ${active ? 'bg-amber-50 text-amber-700' : 'text-ink hover:bg-surface-100'}
                            disabled:opacity-70
                          `}
                        >
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
                            {switching ? <Loader2 size={16} className="animate-spin" /> : <Building2 size={16} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">{organization.name}</p>
                            {organization.email && (
                              <p className="truncate text-xs text-ink-muted">{organization.email}</p>
                            )}
                          </div>
                          {active && <Check size={16} className="flex-shrink-0" />}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

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
                      {currentOrg?.name && (
                        <p className="mt-0.5 truncate text-xs font-medium text-amber-600">
                          {currentOrg.name}
                        </p>
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
