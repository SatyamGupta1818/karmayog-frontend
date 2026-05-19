/**
 * Unauthorized Page (403)
 *
 * Shown when a user tries to access a module they don't have READ permission for.
 * Premium SaaS-styled with a back-to-dashboard action.
 */

import { useNavigate } from 'react-router-dom'
import { ShieldOff, ArrowLeft, Home } from 'lucide-react'

export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        {/* Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-2xl shadow-red-500/20">
            <ShieldOff size={44} className="text-white" strokeWidth={1.5} />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-red-400 to-rose-600 opacity-15 blur-xl" />
          {/* Floating badge */}
          <div className="absolute -top-2 -right-2 px-2.5 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold tracking-wider shadow-lg">
            403
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            You don't have the required permissions to access this page.
            Please contact your administrator if you believe this is an error.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-xl
              border border-slate-200 bg-white
              text-sm font-medium text-slate-700
              shadow-sm hover:shadow-md
              transition-all duration-200 hover:border-slate-300
            "
          >
            <ArrowLeft size={15} />
            Go Back
          </button>

          <button
            onClick={() => navigate('/dashboard', { replace: true })}
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
            <Home size={15} />
            Dashboard
          </button>
        </div>

        {/* Help text */}
        <p className="text-xs text-slate-400 mt-4">
          Error code: <span className="font-mono font-medium">PERMISSION_DENIED</span>
        </p>
      </div>
    </div>
  )
}
