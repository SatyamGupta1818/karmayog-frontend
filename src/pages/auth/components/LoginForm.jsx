/**
 * LoginForm.jsx
 * src/pages/auth/components/LoginForm.jsx
 *
 * Step 1: Enter email → POST /auth/request-otp
 * Step 2: Enter OTP  → POST /auth/verify-otp → tokens stored → onSuccess()
 * Resend:              POST /auth/resend-otp  → fresh OTP, resets countdown
 *
 * Toast events:
 *   success  → OTP sent, OTP resent, login success
 *   error    → API failures, invalid OTP (also shown inline in OTP boxes)
 *   warning  → account locked, OTP cooldown
 */

import { useState, useRef, useEffect } from 'react'
import authService, { getErrorMessage } from '../../../apis/services/auth/auth.service'
import { toast } from '../../../components/common/Toast'

export default function LoginForm({ onSuccess }) {
  const [step, setStep] = useState('email')  // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')        // inline error under OTP boxes
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef([])

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // ── Step 1: Request OTP ───────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      await authService.requestOtp({ email })
      setStep('otp')
      setCountdown(30)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
      toast.success('OTP sent!', `A 6-digit code was sent to ${email}`)
    } catch (err) {
      console.log('err', err)
      const msg = getErrorMessage(err)
      const status = err?.response?.status ?? err?.statusCode

      // 400 → already sent; 401 → locked — show as warning
      if (status === 400 || status === 401) {
        toast.warning('Could not send OTP', msg)
      } else {
        toast.error('Something went wrong', msg)
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── OTP box interactions ──────────────────────────────────────────────────
  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
    if (next.join('').length === 6) handleVerify(next.join(''))
  }

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerify = async (code = otp.join('')) => {
    if (code.length < 6) return
    setError('')
    setLoading(true)
    try {
      const res = await authService.verifyOtp({ email, otp: code })
      // Tokens stored inside authService.verifyOtp
      toast.success(
        'Welcome back! 👋',
        `Signed in as ${res.user?.firstName ?? email}`,
        3000,
      )
      // Small delay so the user sees the success toast before navigation
      setTimeout(() => onSuccess(res), 700)
    } catch (err) {
      console.log('err', err)
      const msg = getErrorMessage(err)
      setError(msg)
      toast.error('Verification failed', msg)
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return
    setError('')
    setLoading(true)
    try {
      await authService.resendOtp({ email })
      setOtp(['', '', '', '', '', ''])
      setCountdown(30)
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
      toast.success('New OTP sent!', 'The previous code has been invalidated.', 3500)
    } catch (err) {
      const msg = getErrorMessage(err)
      toast.error('Resend failed', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
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
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <polyline points="2,4 12,13 22,4" />
                  </svg>
                </span>
                <input
                  type="email"
                  className="lf-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  autoFocus
                  disabled={loading}
                />
              </div>
              {error && <p className="lf-error">{error}</p>}
            </div>

            <button
              type="submit"
              className={`lf-btn ${loading ? 'lf-btn--loading' : ''}`}
              disabled={loading}
            >
              {loading
                ? <><span className="lf-spinner" /> Sending OTP…</>
                : <>Continue <span>→</span></>}
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
            <button
              className="lf-back"
              onClick={() => {
                setStep('email')
                setOtp(['', '', '', '', '', ''])
                setError('')
              }}
              disabled={loading}
            >
              ← Back
            </button>
            <h2 className="lf-title">Check your inbox</h2>
            <p className="lf-sub">
              We sent a 6-digit code to<br />
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
                className={`lf-otp-box ${digit ? 'lf-otp-box--filled' : ''} ${error ? 'lf-otp-box--error' : ''}`}
                value={digit}
                onChange={e => handleOtpChange(e.target.value, i)}
                onKeyDown={e => handleOtpKeyDown(e, i)}
                disabled={loading}
              />
            ))}
          </div>

          {error && (
            <p className="lf-error" style={{ textAlign: 'center', marginTop: 8 }}>
              {error}
            </p>
          )}

          <button
            className={`lf-btn ${loading ? 'lf-btn--loading' : ''}`}
            disabled={loading || otp.join('').length < 6}
            onClick={() => handleVerify()}
            style={{ marginTop: 24 }}
          >
            {loading
              ? <><span className="lf-spinner" /> Verifying…</>
              : <>Verify & Sign In <span>→</span></>}
          </button>

          <div className="lf-resend">
            {countdown > 0 ? (
              <span>
                Resend OTP in{' '}
                <strong style={{ color: '#0d1b3e' }}>{countdown}s</strong>
              </span>
            ) : (
              <button
                className="lf-resend-btn"
                onClick={handleResend}
                disabled={loading}
              >
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
