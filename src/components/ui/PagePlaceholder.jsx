/**
 * PagePlaceholder.jsx
 *
 * Reusable placeholder used by all empty pages.
 * Replace this component's internals with real content when building out each page.
 */

import * as Icons from 'lucide-react'

export default function PagePlaceholder({ title, description, icon = 'LayoutDashboard', color = 'brand' }) {
  const IconComponent = Icons[icon] ?? Icons.LayoutDashboard

  const colorMap = {
    brand:   { bg: 'bg-brand-50',   icon: 'text-brand-500',   border: 'border-brand-100' },
    blue:    { bg: 'bg-blue-50',    icon: 'text-blue-500',    border: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', border: 'border-emerald-100' },
    violet:  { bg: 'bg-violet-50',  icon: 'text-violet-500',  border: 'border-violet-100' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-500',   border: 'border-amber-100' },
  }

  const c = colorMap[color] ?? colorMap.brand

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        {description && (
          <p className="text-sm text-ink-muted mt-1">{description}</p>
        )}
      </div>

      {/* Placeholder card */}
      <div className={`
        flex flex-col items-center justify-center
        min-h-[400px] rounded-2xl border-2 border-dashed
        ${c.border} ${c.bg}
        text-center p-8 gap-4
      `}>
        <div className={`p-5 rounded-2xl bg-white shadow-card ${c.icon}`}>
          <IconComponent size={36} strokeWidth={1.5} />
        </div>

        <div>
          <h3 className="text-lg font-medium text-ink">{title}</h3>
          <p className="text-sm text-ink-muted mt-1 max-w-xs">
            This page is a placeholder. Build out the {title.toLowerCase()} content here.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-surface-200 shadow-sm">
          <Icons.Code size={13} className="text-ink-muted" />
          <span className="text-xs font-mono text-ink-muted">
            src/pages/{title.toLowerCase().replace(/\s/g, '-')}/index.jsx
          </span>
        </div>
      </div>
    </div>
  )
}
