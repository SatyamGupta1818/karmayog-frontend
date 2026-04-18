/**
 * StatsCard.jsx — Animated KPI cards with glassmorphism + gradient accents
 */

import * as Icons from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const end = parseInt(target, 10)
    if (isNaN(end)) { setCount(target); return }
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

const THEMES = {
  navy: {
    card: 'linear-gradient(135deg, #0d1b3e 0%, #1a2f6b 100%)',
    border: 'rgba(255,255,255,0.08)',
    iconWrap: 'rgba(255,255,255,0.12)',
    iconColor: '#f59e0b',
    value: '#ffffff',
    title: 'rgba(255,255,255,0.9)',
    sub: 'rgba(255,255,255,0.5)',
    badge: { bg: 'rgba(255,255,255,0.15)', color: '#fff' },
    glow: 'rgba(13,27,62,0.4)',
  },
  yellow: {
    card: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    border: 'rgba(255,255,255,0.2)',
    iconWrap: 'rgba(255,255,255,0.25)',
    iconColor: '#fff',
    value: '#ffffff',
    title: 'rgba(255,255,255,0.95)',
    sub: 'rgba(255,255,255,0.65)',
    badge: { bg: 'rgba(255,255,255,0.25)', color: '#fff' },
    glow: 'rgba(245,158,11,0.35)',
  },
  teal: {
    card: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
    border: 'rgba(255,255,255,0.1)',
    iconWrap: 'rgba(255,255,255,0.15)',
    iconColor: '#fff',
    value: '#ffffff',
    title: 'rgba(255,255,255,0.9)',
    sub: 'rgba(255,255,255,0.55)',
    badge: { bg: 'rgba(255,255,255,0.2)', color: '#fff' },
    glow: 'rgba(13,148,136,0.35)',
  },
  indigo: {
    card: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
    border: 'rgba(255,255,255,0.1)',
    iconWrap: 'rgba(255,255,255,0.15)',
    iconColor: '#fff',
    value: '#ffffff',
    title: 'rgba(255,255,255,0.9)',
    sub: 'rgba(255,255,255,0.55)',
    badge: { bg: 'rgba(255,255,255,0.2)', color: '#fff' },
    glow: 'rgba(99,102,241,0.35)',
  },
}

export default function StatsCard({ title, value, subtitle, icon, trend, trendLabel, accent = 'navy', delay = 0 }) {
  const IconComponent = Icons[icon] ?? Icons.BarChart2
  const isPositive = trend >= 0
  const animated = useCountUp(value)
  const t = THEMES[accent] || THEMES.navy
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div style={{
      background: t.card,
      border: `1px solid ${t.border}`,
      borderRadius: 20,
      padding: '22px 22px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxShadow: `0 8px 32px ${t.glow}, 0 2px 8px rgba(0,0,0,0.08)`,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.97)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)'; e.currentTarget.style.boxShadow = `0 16px 40px ${t.glow}, 0 4px 12px rgba(0,0,0,0.12)` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = `0 8px 32px ${t.glow}, 0 2px 8px rgba(0,0,0,0.08)` }}
    >
      {/* Decorative blob */}
      <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 20, bottom: -30, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: t.iconWrap, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <IconComponent size={22} color={t.iconColor} strokeWidth={1.75} />
        </div>
        {trend !== undefined && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 10, background: t.badge.bg, color: t.badge.color, fontSize: 12, fontWeight: 700, backdropFilter: 'blur(6px)' }}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div>
        <p style={{ fontSize: 34, fontWeight: 900, color: t.value, lineHeight: 1, margin: 0, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>
          {animated}
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: t.title, margin: '6px 0 0' }}>{title}</p>
        {subtitle && <p style={{ fontSize: 12, color: t.sub, marginTop: 3 }}>{subtitle}</p>}
        {trendLabel && <p style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>{trendLabel}</p>}
      </div>
    </div>
  )
}
