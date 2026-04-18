/**
 * RegisterForm.jsx
 * File: src/pages/auth/components/RegisterForm.jsx
 *
 * Multi-step org registration form (3 steps)
 */

import { useState } from 'react'

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education',
  'Manufacturing', 'Retail', 'Media', 'Other',
]
const SIZES = ['1–10', '11–50', '51–200', '201–500', '500+']

const STEPS = ['Organization', 'Admin Account', 'Confirm']

export default function RegisterForm({ onSuccess }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    orgName: '',
    industry: '',
    size: '',
    website: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    agreeTerms: false,
  })

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validateStep = () => {
    const e = {}
    if (step === 0) {
      if (!form.orgName.trim()) e.orgName = 'Organization name is required'
      if (!form.industry) e.industry = 'Select an industry'
      if (!form.size) e.size = 'Select org size'
    }
    if (step === 1) {
      if (!form.firstName.trim()) e.firstName = 'First name required'
      if (!form.lastName.trim()) e.lastName = 'Last name required'
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
      if (!form.role.trim()) e.role = 'Your role is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) return
    setStep(s => s + 1)
  }

  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    if (!form.agreeTerms) {
      setErrors({ agreeTerms: 'Please accept the terms to continue.' })
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
    onSuccess()
  }

  return (
    <div className="rf-root">
      {/* Step indicator */}
      <div className="rf-steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`rf-step ${i <= step ? 'rf-step--active' : ''} ${i < step ? 'rf-step--done' : ''}`}>
            <div className="rf-step-dot">
              {i < step ? '✓' : i + 1}
            </div>
            <span className="rf-step-label">{s}</span>
            {i < STEPS.length - 1 && <div className="rf-step-line" />}
          </div>
        ))}
      </div>

      {/* Step 0: Org info */}
      {step === 0 && (
        <div className="rf-fields">
          <div className="rf-header">
            <h2 className="lf-title">Your Organization</h2>
            <p className="lf-sub">Tell us about the company you're setting up.</p>
          </div>

          <Field label="Organization Name" error={errors.orgName}>
            <input className="lf-input" placeholder="Acme Corp" value={form.orgName}
              onChange={e => set('orgName', e.target.value)} />
          </Field>

          <Field label="Industry" error={errors.industry}>
            <select className="lf-input lf-select" value={form.industry} onChange={e => set('industry', e.target.value)}>
              <option value="">Select industry…</option>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </Field>

          <Field label="Organization Size" error={errors.size}>
            <div className="rf-pills">
              {SIZES.map(s => (
                <button key={s} type="button"
                  className={`rf-pill ${form.size === s ? 'rf-pill--active' : ''}`}
                  onClick={() => set('size', s)}
                >{s}</button>
              ))}
            </div>
          </Field>

          <Field label="Website (optional)">
            <input className="lf-input" placeholder="https://yourcompany.com" value={form.website}
              onChange={e => set('website', e.target.value)} />
          </Field>
        </div>
      )}

      {/* Step 1: Admin account */}
      {step === 1 && (
        <div className="rf-fields">
          <div className="rf-header">
            <h2 className="lf-title">Admin Account</h2>
            <p className="lf-sub">This will be the primary admin for your org.</p>
          </div>

          <div className="rf-row">
            <Field label="First Name" error={errors.firstName}>
              <input className="lf-input" placeholder="Alex" value={form.firstName}
                onChange={e => set('firstName', e.target.value)} />
            </Field>
            <Field label="Last Name" error={errors.lastName}>
              <input className="lf-input" placeholder="Johnson" value={form.lastName}
                onChange={e => set('lastName', e.target.value)} />
            </Field>
          </div>

          <Field label="Work Email" error={errors.email}>
            <input className="lf-input" type="email" placeholder="alex@acmecorp.com" value={form.email}
              onChange={e => set('email', e.target.value)} />
          </Field>

          <Field label="Phone (optional)">
            <input className="lf-input" type="tel" placeholder="+91 98765 43210" value={form.phone}
              onChange={e => set('phone', e.target.value)} />
          </Field>

          <Field label="Your Role / Designation" error={errors.role}>
            <input className="lf-input" placeholder="CEO, CTO, Project Manager…" value={form.role}
              onChange={e => set('role', e.target.value)} />
          </Field>
        </div>
      )}

      {/* Step 2: Confirm */}
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
            <SummaryRow label="Admin"        value={`${form.firstName} ${form.lastName}`} />
            <SummaryRow label="Email"        value={form.email} />
            <SummaryRow label="Role"         value={form.role} />
          </div>

          <label className={`rf-terms ${errors.agreeTerms ? 'rf-terms--error' : ''}`}>
            <input type="checkbox" checked={form.agreeTerms}
              onChange={e => { set('agreeTerms', e.target.checked); setErrors(er => ({...er, agreeTerms: undefined})) }} />
            <span>
              I agree to Karmayog's{' '}
              <a href="#" className="rf-link">Terms of Service</a> and{' '}
              <a href="#" className="rf-link">Privacy Policy</a>.
            </span>
          </label>
          {errors.agreeTerms && <p className="lf-error">{errors.agreeTerms}</p>}
        </div>
      )}

      {/* Navigation */}
      <div className="rf-nav">
        {step > 0 && (
          <button className="rf-back-btn" onClick={handleBack}>← Back</button>
        )}
        {step < STEPS.length - 1 ? (
          <button className="lf-btn" style={{ flex: 1, marginLeft: step > 0 ? 12 : 0 }} onClick={handleNext}>
            Continue →
          </button>
        ) : (
          <button className={`lf-btn ${loading ? 'lf-btn--loading' : ''}`} style={{ flex: 1, marginLeft: 12 }} onClick={handleSubmit} disabled={loading}>
            {loading ? <><span className="lf-spinner" /> Creating workspace…</> : <>Launch Workspace 🚀</>}
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
