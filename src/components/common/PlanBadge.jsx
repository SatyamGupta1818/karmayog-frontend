/**
 * PlanBadge.jsx
 * File: src/components/common/PlanBadge.jsx
 *
 * Displays the active subscription plan as a badge.
 * Use anywhere in the app — sidebar, header, settings, etc.
 *
 * Usage:
 *   import PlanBadge from '../components/common/PlanBadge'
 *   <PlanBadge />
 */

import { useSelector } from 'react-redux'
import { selectPlan } from '../../store/slices/subscriptionSlice'

const PLAN_STYLES = {
  free:    { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.25)' },
  premium: { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', border: 'rgba(245,158,11,0.3)'  },
  pro:     { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8', border: 'rgba(99,102,241,0.3)'  },
}

export default function PlanBadge({ className = '' }) {
  const plan = useSelector(selectPlan)
  if (!plan) return null

  const s = PLAN_STYLES[plan.id] ?? PLAN_STYLES.free
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        borderRadius: 100,
        padding: '3px 10px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {plan.icon} {plan.name}
    </span>
  )
}
