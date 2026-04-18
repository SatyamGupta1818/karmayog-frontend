/**
 * LoginForm.jsx
 * File: src/pages/auth/components/LoginForm.jsx
 *
 * Step 1: Enter email → Step 2: Enter OTP (dummy: 123456)
 */

import { useState, useRef, useEffect } from 'react'

const DUMMY_OTP = '123456'
const DUMMY_EMAILS = ['alex@karmayog.com', 'admin@example.com'] // any email works

export default function LoginForm({ onSuccess }) {
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef([])

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setStep('otp')
    setCountdown(30)
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
    // Auto-verify when all 6 filled
    if (next.join('').length === 6) handleVerify(next.join(''))
  }

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handleVerify = async (code = otp.join('')) => {
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    if (code === DUMMY_OTP) {
      onSuccess()
    } else {
      setError('Invalid OTP. Try 123456 for demo.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setOtp(['', '', '', '', '', ''])
    setError('')
    setCountdown(30)
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="lf-root">
      {step === 'email' ? (
        <>
          <div className="lf-header">
            <h2 className="lf-title">Welcome back</h2>
            <p className="lf-sub">Enter your work email to receive a one-time passcode.</p>
          </div>

          <form onSubmit={handleSendOTP} className="lf-form">
            <div className="lf-field">
              <label className="lf-label">Work Email</label>
              <div className="lf-input-wrap">
                <span className="lf-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="2,4 12,13 22,4"/>
                  </svg>
                </span>
                <input
                  type="email"
                  className="lf-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  autoFocus
                />
              </div>
              {error && <p className="lf-error">{error}</p>}
            </div>

            <button type="submit" className={`lf-btn ${loading ? 'lf-btn--loading' : ''}`} disabled={loading}>
              {loading ? (
                <><span className="lf-spinner" /> Sending OTP…</>
              ) : (
                <>Continue <span>→</span></>
              )}
            </button>
          </form>

          <div className="lf-hint">
            <span className="lf-hint-icon">🔒</span>
            We'll send a 6-digit code to verify your identity.
          </div>
        </>
      ) : (
        <>
          <div className="lf-header">
            <button className="lf-back" onClick={() => { setStep('email'); setOtp(['','','','','','']); setError('') }}>
              ← Back
            </button>
            <h2 className="lf-title">Check your inbox</h2>
            <p className="lf-sub">
              We sent a 6-digit code to<br/>
              <strong style={{ color: '#0a0f1e' }}>{email}</strong>
            </p>
          </div>

          <div className="lf-otp-wrap">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`lf-otp-box ${digit ? 'lf-otp-box--filled' : ''}`}
                value={digit}
                onChange={e => handleOtpChange(e.target.value, i)}
                onKeyDown={e => handleOtpKeyDown(e, i)}
              />
            ))}
          </div>

          {error && <p className="lf-error" style={{ textAlign: 'center', marginTop: 8 }}>{error}</p>}

          <button
            className={`lf-btn ${loading ? 'lf-btn--loading' : ''}`}
            disabled={loading || otp.join('').length < 6}
            onClick={() => handleVerify()}
            style={{ marginTop: 24 }}
          >
            {loading ? <><span className="lf-spinner" /> Verifying…</> : <>Verify & Sign In <span>→</span></>}
          </button>

          <div className="lf-resend">
            {countdown > 0 ? (
              <span>Resend OTP in <strong style={{ color: '#0d1b3e' }}>{countdown}s</strong></span>
            ) : (
              <button className="lf-resend-btn" onClick={handleResend}>Resend OTP</button>
            )}
          </div>

          <div className="lf-hint" style={{ marginTop: 16 }}>
            <span className="lf-hint-icon">💡</span>
            Demo OTP: <strong>123456</strong>
          </div>
        </>
      )}
    </div>
  )
}
