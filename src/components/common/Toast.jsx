/**
 * Toast.jsx
 * src/components/ui/Toast.jsx
 *
 * Self-contained toast notification system.
 *
 * Exports:
 *   <ToastContainer />  — mount once at app root (or auth page root)
 *   useToast()          — hook to fire toasts from any component
 *   toast               — imperative API (use outside React components)
 *
 * Usage (hook):
 *   const { success, error, info, warning } = useToast()
 *   success('Organization created!', 'You can now log in.')
 *   error('Something went wrong', 'Email already registered.')
 *
 * Usage (imperative — e.g. inside a service):
 *   import { toast } from '@/components/ui/Toast'
 *   toast.success('Done!')
 */

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────
// variant: 'success' | 'error' | 'warning' | 'info'

// ─── Internal event bus (works outside React too) ──────────────────────────────
const listeners = new Set()
const emit = (toast) => listeners.forEach(fn => fn(toast))

let _nextId = 1

// ─── Imperative API ────────────────────────────────────────────────────────────
export const toast = {
  success: (title, description, duration) =>
    emit({ id: _nextId++, variant: 'success', title, description, duration }),
  error: (title, description, duration) =>
    emit({ id: _nextId++, variant: 'error',   title, description, duration }),
  warning: (title, description, duration) =>
    emit({ id: _nextId++, variant: 'warning', title, description, duration }),
  info: (title, description, duration) =>
    emit({ id: _nextId++, variant: 'info',    title, description, duration }),
}

// ─── Context / Hook ────────────────────────────────────────────────────────────
const ToastContext = createContext(toast)

export const useToast = () => useContext(ToastContext)

// ─── Config ────────────────────────────────────────────────────────────────────
const VARIANT = {
  success: {
    bg:          '#f0fdf4',
    border:      '#bbf7d0',
    iconBg:      '#22c55e',
    titleColor:  '#14532d',
    textColor:   '#166534',
    progressBg:  '#22c55e',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    bg:          '#fff1f2',
    border:      '#fecdd3',
    iconBg:      '#ef4444',
    titleColor:  '#7f1d1d',
    textColor:   '#991b1b',
    progressBg:  '#ef4444',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  warning: {
    bg:          '#fffbeb',
    border:      '#fde68a',
    iconBg:      '#f59e0b',
    titleColor:  '#78350f',
    textColor:   '#92400e',
    progressBg:  '#f59e0b',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  info: {
    bg:          '#eff6ff',
    border:      '#bfdbfe',
    iconBg:      '#3b82f6',
    titleColor:  '#1e3a8a',
    textColor:   '#1d4ed8',
    progressBg:  '#3b82f6',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
}

const DEFAULT_DURATION = 4500 // ms

// ─── Single Toast Item ─────────────────────────────────────────────────────────
function ToastItem({ item, onRemove }) {
  const [visible, setVisible]   = useState(false)  // entry animation
  const [leaving, setLeaving]   = useState(false)  // exit animation
  const [paused,  setPaused]    = useState(false)
  const [progress, setProgress] = useState(100)
  const timerRef    = useRef(null)
  const startRef    = useRef(null)
  const remainRef   = useRef(item.duration ?? DEFAULT_DURATION)

  const cfg = VARIANT[item.variant] ?? VARIANT.info

  // Entry animation — tiny delay so the browser paints first
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 16)
    return () => clearTimeout(t)
  }, [])

  const dismiss = useCallback(() => {
    setLeaving(true)
    setTimeout(() => onRemove(item.id), 380)
  }, [item.id, onRemove])

  // Progress bar + auto-dismiss
  const startTimer = useCallback(() => {
    startRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed  = Date.now() - startRef.current
      const pct      = Math.max(0, 100 - (elapsed / remainRef.current) * 100)
      setProgress(pct)
      if (pct <= 0) {
        clearInterval(timerRef.current)
        dismiss()
      }
    }, 30)
  }, [dismiss])

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [startTimer])

  const handleMouseEnter = () => {
    setPaused(true)
    clearInterval(timerRef.current)
    remainRef.current -= Date.now() - startRef.current
  }

  const handleMouseLeave = () => {
    setPaused(false)
    startTimer()
  }

  return (
    <div
      style={{
        ...styles.item,
        background:   cfg.bg,
        border:       `1px solid ${cfg.border}`,
        opacity:      visible && !leaving ? 1 : 0,
        transform:    visible && !leaving
          ? 'translateX(0) scale(1)'
          : leaving
            ? 'translateX(110%) scale(0.95)'
            : 'translateX(110%) scale(0.95)',
        transition:   leaving
          ? 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.4,0,1,1)'
          : 'opacity 0.38s ease, transform 0.38s cubic-bezier(0.22,1,0.36,1)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon */}
      <div style={{ ...styles.iconWrap, background: cfg.iconBg }}>
        {cfg.icon}
      </div>

      {/* Text */}
      <div style={styles.textWrap}>
        <p style={{ ...styles.title, color: cfg.titleColor }}>{item.title}</p>
        {item.description && (
          <p style={{ ...styles.desc, color: cfg.textColor }}>{item.description}</p>
        )}
      </div>

      {/* Close button */}
      <button style={styles.closeBtn} onClick={dismiss} aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cfg.textColor} strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div style={{
          ...styles.progressBar,
          width:      `${progress}%`,
          background: cfg.progressBg,
          transition: paused ? 'none' : 'width 30ms linear',
        }} />
      </div>
    </div>
  )
}

// ─── Container ─────────────────────────────────────────────────────────────────
export function ToastContainer() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const handler = (t) => setItems(prev => [...prev, t])
    listeners.add(handler)
    return () => listeners.delete(handler)
  }, [])

  const remove = useCallback((id) => {
    setItems(prev => prev.filter(t => t.id !== id))
  }, [])

  if (items.length === 0) return null

  return (
    <ToastContext.Provider value={toast}>
      <div style={styles.container} aria-live="polite" aria-atomic="false">
        {items.map(item => (
          <ToastItem key={item.id} item={item} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  container: {
    position:      'fixed',
    top:           24,
    right:         24,
    zIndex:        9999,
    display:       'flex',
    flexDirection: 'column',
    gap:           12,
    pointerEvents: 'none',    // container itself not clickable
    width:         360,
    maxWidth:      'calc(100vw - 48px)',
  },
  item: {
    display:       'flex',
    alignItems:    'flex-start',
    gap:           12,
    padding:       '14px 14px 18px',
    borderRadius:  16,
    boxShadow:     '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
    position:      'relative',
    overflow:      'hidden',
    pointerEvents: 'all',     // items are clickable
    cursor:        'default',
  },
  iconWrap: {
    width:          36,
    height:         36,
    borderRadius:   10,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    boxShadow:      '0 2px 8px rgba(0,0,0,0.15)',
  },
  textWrap: {
    flex:    1,
    minWidth: 0,
  },
  title: {
    margin:     0,
    fontSize:   14,
    fontWeight: 700,
    lineHeight: 1.35,
    fontFamily: "'Sora', sans-serif",
  },
  desc: {
    margin:     '3px 0 0',
    fontSize:   12,
    fontWeight: 500,
    lineHeight: 1.5,
    fontFamily: "'DM Sans', sans-serif",
    opacity:    0.85,
  },
  closeBtn: {
    background:  'none',
    border:      'none',
    cursor:      'pointer',
    padding:     4,
    flexShrink:  0,
    borderRadius: 6,
    display:     'flex',
    alignItems:  'center',
    opacity:     0.6,
    transition:  'opacity 0.15s',
    marginTop:   -2,
  },
  progressTrack: {
    position:     'absolute',
    bottom:       0,
    left:         0,
    right:        0,
    height:       3,
    background:   'rgba(0,0,0,0.06)',
    borderRadius: '0 0 16px 16px',
    overflow:     'hidden',
  },
  progressBar: {
    height:       '100%',
    borderRadius: '0 0 16px 16px',
    opacity:      0.7,
  },
}