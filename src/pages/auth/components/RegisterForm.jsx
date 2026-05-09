/**
 * RegisterForm.jsx
 * src/pages/auth/components/RegisterForm.jsx
 *
 * 3-step org registration form.
 * On submit → POST /auth/register → onSuccess(response)
 *
 * Toast events:
 *   success → workspace created
 *   error   → 409 conflict, network error
 *   warning → validation nudge (shouldn't normally fire from API since
 *             we validate client-side first, but kept for safety)
 */

import { useState } from 'react'
import authService from '../../../apis/services/auth/auth.service'
import { toast } from '../../../components/common/Toast'

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education',
  'Manufacturing', 'Retail', 'Media', 'Other',
]
const SIZES = ['1–10', '11–50', '51–200', '201–500', '500+']

const SIZE_MAP = {
  '1–10':    '1-10',
  '11–50':   '11-50',
  '51–200':  '51-200',
  '201–500': '201-1000',
  '500+':    '1000+',
}

const INDUSTRY_MAP = {
  'Technology':    'startup',
  'Finance':       'enterprise',
  'Healthcare':    'enterprise',
  'Education':     'non_profit',
  'Manufacturing': 'enterprise',
  'Retail':        'sme',
  'Media':         'sme',
  'Other':         'other',
}

const STEPS = ['Organization', 'Admin Account', 'Confirm']

export default function RegisterForm({ onSuccess }) {
  const [step, setStep]         = useState(0)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState('')

  const [form, setForm] = useState({
    orgName:    '',
    industry:   '',
    size:       '',
    website:    '',
    firstName:  '',
    lastName:   '',
    email:      '',
    phone:      '',
    role:       '',
    agreeTerms: false,
  })

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
    setApiError('')
  }

  // ── Per-step validation ───────────────────────────────────────────────────
  const validateStep = () => {
    const e = {}
    if (step === 0) {
      if (!form.orgName.trim())  e.orgName  = 'Organization name is required'
      if (!form.industry)        e.industry = 'Select an industry'
      if (!form.size)            e.size     = 'Select organization size'
      if (form.website && !/\S+@\S+\.\S+/.test(form.website))
                                 e.website  = 'Enter a valid organization email'
    }
    if (step === 1) {
      if (!form.firstName.trim())                            e.firstName = 'First name required'
      if (!form.lastName.trim())                             e.lastName  = 'Last name required'
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email))  e.email     = 'Valid work email required'
      if (!form.role.trim())                                 e.role      = 'Your designation is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) return
    setStep(s => s + 1)
  }

  const handleBack = () => {
    setApiError('')
    setStep(s => s - 1)
  }

  // ── Submit → POST /auth/register ──────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.agreeTerms) {
      setErrors({ agreeTerms: 'Please accept the terms to continue.' })
      return
    }

    setApiError('')
    setLoading(true)

    try {
      const payload = {
        firstName:        form.firstName.trim(),
        lastName:         form.lastName.trim(),
        workEmail:        form.email.trim(),
        mobileNo:         form.phone.trim() || '',
        designation:      form.role.trim(),
        organizationName: form.orgName.trim(),
        organizationType: INDUSTRY_MAP[form.industry] ?? 'other',
        organizationSize: SIZE_MAP[form.size] ?? form.size,
        orgEmail:         form.website.trim() || form.email.trim(),
      }

      const res = await authService.registerOrganization(payload)

      toast.success(
        'Workspace created! 🚀',
        `${form.orgName} is ready. Sign in with your work email.`,
        5000,
      )
      // Small delay so toast is visible before parent switches to login tab
      setTimeout(() => onSuccess(res), 900)
    } catch (err) {
      const msg = err?.message ?? 'Registration failed. Please try again.'

      if (err?.statusCode === 409) {
        // Conflict — email or org already exists
        toast.error('Already registered', msg)
      } else if (err?.statusCode === 400) {
        toast.warning('Check your details', msg)
      } else {
        toast.error('Registration failed', msg)
      }
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="rf-root">
      {/* Step indicator */}
      <div className="rf-steps">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`rf-step ${i <= step ? 'rf-step--active' : ''} ${i < step ? 'rf-step--done' : ''}`}
          >
            <div className="rf-step-dot">{i < step ? '✓' : i + 1}</div>
            <span className="rf-step-label">{s}</span>
            {i < STEPS.length - 1 && <div className="rf-step-line" />}
          </div>
        ))}
      </div>

      {/* ── Step 0: Organization ──────────────────────────────────────────── */}
      {step === 0 && (
        <div className="rf-fields">
          <div className="rf-header">
            <h2 className="lf-title">Your Organization</h2>
            <p className="lf-sub">Tell us about the company you're setting up.</p>
          </div>

          <Field label="Organization Name" error={errors.orgName}>
            <input
              className="lf-input"
              placeholder="Acme Corp"
              value={form.orgName}
              onChange={e => set('orgName', e.target.value)}
            />
          </Field>

          <Field label="Industry" error={errors.industry}>
            <select
              className="lf-input lf-select"
              value={form.industry}
              onChange={e => set('industry', e.target.value)}
            >
              <option value="">Select industry…</option>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </Field>

          <Field label="Organization Email (optional)" error={errors.website}>
            <input
              className="lf-input"
              type="email"
              placeholder="contact@acmecorp.com"
              value={form.website}
              onChange={e => set('website', e.target.value)}
            />
          </Field>

          <Field label="Organization Size" error={errors.size}>
            <div className="rf-pills">
              {SIZES.map(s => (
                <button
                  key={s}
                  type="button"
                  className={`rf-pill ${form.size === s ? 'rf-pill--active' : ''}`}
                  onClick={() => set('size', s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {/* ── Step 1: Admin account ─────────────────────────────────────────── */}
      {step === 1 && (
        <div className="rf-fields">
          <div className="rf-header">
            <h2 className="lf-title">Admin Account</h2>
            <p className="lf-sub">This will be the primary admin for your org.</p>
          </div>

          <div className="rf-row">
            <Field label="First Name" error={errors.firstName}>
              <input
                className="lf-input"
                placeholder="Alex"
                value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
              />
            </Field>
            <Field label="Last Name" error={errors.lastName}>
              <input
                className="lf-input"
                placeholder="Johnson"
                value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Work Email" error={errors.email}>
            <input
              className="lf-input"
              type="email"
              placeholder="alex@acmecorp.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
          </Field>

          <Field label="Phone (optional)">
            <input
              className="lf-input"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
            />
          </Field>

          <Field label="Your Role / Designation" error={errors.role}>
            <input
              className="lf-input"
              placeholder="CEO, CTO, Project Manager…"
              value={form.role}
              onChange={e => set('role', e.target.value)}
            />
          </Field>
        </div>
      )}

      {/* ── Step 2: Confirm ───────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="rf-fields">
          <div className="rf-header">
            <h2 className="lf-title">All set!</h2>
            <p className="lf-sub">Review and confirm your organization details.</p>
          </div>

          <div className="rf-summary">
            <SummaryRow label="Organization" value={form.orgName} />
            <SummaryRow label="Industry"     value={form.industry} />
            <SummaryRow label="Org Size"     value={form.size} />
            <SummaryRow label="Org Email"    value={form.website || form.email} />
            <SummaryRow label="Admin"        value={`${form.firstName} ${form.lastName}`} />
            <SummaryRow label="Work Email"   value={form.email} />
            <SummaryRow label="Designation"  value={form.role} />
          </div>

          <label className={`rf-terms ${errors.agreeTerms ? 'rf-terms--error' : ''}`}>
            <input
              type="checkbox"
              checked={form.agreeTerms}
              onChange={e => {
                set('agreeTerms', e.target.checked)
                setErrors(er => ({ ...er, agreeTerms: undefined }))
              }}
            />
            <span>
              I agree to Karmayog's{' '}
              <a href="#" className="rf-link">Terms of Service</a> and{' '}
              <a href="#" className="rf-link">Privacy Policy</a>.
            </span>
          </label>
          {errors.agreeTerms && <p className="lf-error">{errors.agreeTerms}</p>}

          {/* Server-side error banner */}
          {apiError && (
            <div className="rf-api-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <div className="rf-nav">
        {step > 0 && (
          <button className="rf-back-btn" onClick={handleBack} disabled={loading}>
            ← Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            className="lf-btn"
            style={{ flex: 1, marginLeft: step > 0 ? 12 : 0 }}
            onClick={handleNext}
          >
            Continue →
          </button>
        ) : (
          <button
            className={`lf-btn ${loading ? 'lf-btn--loading' : ''}`}
            style={{ flex: 1, marginLeft: 12 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <><span className="lf-spinner" /> Creating workspace…</>
              : <>Launch Workspace 🚀</>}
          </button>
        )}
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="lf-field">
      <label className="lf-label">{label}</label>
      {children}
      {error && <p className="lf-error">{error}</p>}
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="rf-summary-row">
      <span className="rf-summary-label">{label}</span>
      <span className="rf-summary-value">{value || '—'}</span>
    </div>
  )
}