/**
 * PermissionInitializer.jsx
 *
 * Placed inside ProtectedRoute to fetch permissions on app boot.
 * Shows a loading spinner until the permission manifest is available.
 *
 * This ensures all protected pages have permissions loaded before rendering.
 */

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPermissions,
  selectRbacStatus,
  selectRbacError,
} from '../../store/slices/rbacSlice'
import { selectIsAuthenticated } from '../../store/slices/authSlice'
import { Loader2, ShieldAlert, RefreshCw } from 'lucide-react'

export default function PermissionInitializer({ children }) {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const rbacStatus = useSelector(selectRbacStatus)
  const rbacError = useSelector(selectRbacError)

  useEffect(() => {
    if (isAuthenticated && rbacStatus === 'idle') {
      dispatch(fetchPermissions())
    }
  }, [dispatch, isAuthenticated, rbacStatus])

  // ── Loading state ──────────────────────────────────────────
  if (rbacStatus === 'loading' || rbacStatus === 'idle') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Loader2 size={28} className="text-white animate-spin" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 opacity-20 blur-lg animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">Loading permissions...</p>
            <p className="text-xs text-slate-400 mt-1">Setting up your workspace</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────
  if (rbacStatus === 'failed') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-5 max-w-sm text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25">
            <ShieldAlert size={28} className="text-white" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800">Unable to load permissions</p>
            <p className="text-sm text-slate-500 mt-1">
              {typeof rbacError === 'string' ? rbacError : 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
          <button
            onClick={() => dispatch(fetchPermissions())}
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-gradient-to-r from-amber-500 to-orange-500
              text-white text-sm font-semibold
              shadow-md shadow-amber-500/25
              hover:shadow-lg hover:shadow-amber-500/30
              transition-all duration-200 hover:scale-[1.02]
              active:scale-[0.98]
            "
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ── Permissions loaded — render children ───────────────────
  return children
}
