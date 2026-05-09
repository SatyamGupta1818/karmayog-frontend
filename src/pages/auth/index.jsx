/**
 * Auth/index.jsx
 * src/pages/auth/index.jsx
 *
 * Login (email → OTP) + Register as Organization.
 * - Mounts <ToastContainer /> so toasts fire from LoginForm & RegisterForm
 * - After register success → switches to login tab automatically
 * - After login success  → navigate to /dashboard
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm    from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import { ToastContainer } from '../../components/common/Toast'
import './auth.css'

export default function Auth() {
  const [tab, setTab] = useState('login')  // 'login' | 'register'
  const navigate = useNavigate()

  // After register succeeds → flip to login tab so owner can sign in via OTP
  const handleRegisterSuccess = (_res) => {
    setTab('login')
  }

  // After OTP verify succeeds → go to dashboard
  const handleLoginSuccess = (_res) => {
    navigate('/dashboard')
  }

  return (
    <>
      {/* Toast container — renders outside the form card, fixed top-right */}
      <ToastContainer />

      <div className="auth-root">
        {/* ── Left panel — branding ─────────────────────────────────────── */}
        <div className="auth-left">
          <div className="auth-left-grid" />

          {/* Logo */}
          <div className="auth-left-logo">
            <div className="auth-logo-mark">K</div>
            <span className="auth-logo-name">Karmayog</span>
          </div>

          {/* Hero copy */}
          <div className="auth-left-hero">
            <h2 className="auth-left-title">
              Run your<br />
              organization<br />
              <span className="auth-left-accent">smarter.</span>
            </h2>
            <p className="auth-left-sub">
              Unified project management for modern teams.
              Track, collaborate, and ship — faster.
            </p>

            <div className="auth-left-stats">
              {[
                { value: '10k+',  label: 'Organizations' },
                { value: '500k+', label: 'Tasks Tracked' },
                { value: '99.9%', label: 'Uptime' },
              ].map(s => (
                <div key={s.label} className="auth-stat-pill">
                  <span className="auth-stat-val">{s.value}</span>
                  <span className="auth-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating deco card */}
          <div className="auth-deco-card">
            <div className="auth-deco-row">
              <div className="auth-deco-avatar" style={{ background: '#f59e0b' }}>P</div>
              <div className="auth-deco-avatar" style={{ background: '#6366f1', marginLeft: -8 }}>A</div>
              <div className="auth-deco-avatar" style={{ background: '#10b981', marginLeft: -8 }}>D</div>
            </div>
            <div>
              <div className="auth-deco-title">Sprint 14 launched 🚀</div>
              <div className="auth-deco-sub">Karmayog Platform · just now</div>
            </div>
          </div>
        </div>

        {/* ── Right panel — form ────────────────────────────────────────── */}
        <div className="auth-right">
          <div className="auth-form-card">
            {/* Tab switcher */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${tab === 'login' ? 'auth-tab--active' : ''}`}
                onClick={() => setTab('login')}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${tab === 'register' ? 'auth-tab--active' : ''}`}
                onClick={() => setTab('register')}
              >
                Register Org
              </button>
              <div
                className="auth-tab-slider"
                style={{ transform: tab === 'register' ? 'translateX(100%)' : 'translateX(0)' }}
              />
            </div>

            {/* Forms */}
            <div className="auth-form-body">
              {tab === 'login' ? (
                <LoginForm onSuccess={handleLoginSuccess} />
              ) : (
                <RegisterForm onSuccess={handleRegisterSuccess} />
              )}
            </div>
          </div>

          <p className="auth-footer">
            © 2026 Karmayog. Built for teams that mean business.
          </p>
        </div>
      </div>
    </>
  )
}