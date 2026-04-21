/**
 * SubscriptionPlans.jsx
 * File: src/pages/subscription/SubscriptionPlans.jsx
 *
 * Full-screen subscription plan selection shown between org registration
 * and the dashboard. User picks Free / Premium / Pro, then proceeds.
 *
 * Props:
 *   orgName    {string}   – name from registration
 *   onSelect   {fn}       – called with the chosen plan object
 *   onBack     {fn}       – go back to registration
 */

import { useState } from 'react'
import './subscription.css'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Perfect for small teams getting started',
    price: 0,
    period: 'forever',
    badge: null,
    accentColor: '#64748b',
    gradientFrom: '#1e293b',
    gradientTo: '#0f172a',
    icon: '🌱',
    features: [
      { text: 'Up to 5 team members', included: true },
      { text: '3 active projects', included: true },
      { text: 'Basic task management', included: true },
      { text: '1 GB storage', included: true },
      { text: 'Community support', included: true },
      { text: 'Advanced analytics', included: false },
      { text: 'Custom roles & permissions', included: false },
      { text: 'API access', included: false },
      { text: 'Priority support', included: false },
      { text: 'SSO / SAML', included: false },
    ],
    cta: 'Start for Free',
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'For growing teams that need more power',
    price: 29,
    period: 'per month',
    badge: 'Most Popular',
    accentColor: '#f59e0b',
    gradientFrom: '#1a1200',
    gradientTo: '#0d0a00',
    icon: '⚡',
    features: [
      { text: 'Up to 50 team members', included: true },
      { text: 'Unlimited projects', included: true },
      { text: 'Advanced task management', included: true },
      { text: '50 GB storage', included: true },
      { text: 'Email & chat support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom roles & permissions', included: true },
      { text: 'API access', included: true },
      { text: 'Priority support', included: false },
      { text: 'SSO / SAML', included: false },
    ],
    cta: 'Get Premium',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For enterprises demanding the best',
    price: 79,
    period: 'per month',
    badge: 'Enterprise',
    accentColor: '#6366f1',
    gradientFrom: '#0d0b1e',
    gradientTo: '#080612',
    icon: '🚀',
    features: [
      { text: 'Unlimited team members', included: true },
      { text: 'Unlimited projects', included: true },
      { text: 'Full task automation', included: true },
      { text: 'Unlimited storage', included: true },
      { text: '24/7 dedicated support', included: true },
      { text: 'Advanced analytics + BI', included: true },
      { text: 'Custom roles & permissions', included: true },
      { text: 'Full API access + webhooks', included: true },
      { text: 'Priority support SLA', included: true },
      { text: 'SSO / SAML', included: true },
    ],
    cta: 'Go Pro',
  },
]

export default function SubscriptionPlans({ orgName, onSelect, onBack }) {
  const [hovered, setHovered] = useState('premium')
  const [selected, setSelected] = useState(null)
  const [confirming, setConfirming] = useState(false)

  const handleChoose = (plan) => {
    setSelected(plan)
    setConfirming(true)
  }

  const handleConfirm = async () => {
    setConfirming(false)
    await new Promise(r => setTimeout(r, 400))
    onSelect(selected)
  }

  return (
    <div className="sp-root">
      {/* Ambient bg blobs */}
      <div className="sp-blob sp-blob--amber" />
      <div className="sp-blob sp-blob--indigo" />
      <div className="sp-blob sp-blob--slate" />

      {/* Header */}
      <div className="sp-header">
        <button className="sp-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div className="sp-logo">
          <div className="sp-logo-mark">K</div>
          <span className="sp-logo-name">Karmayog</span>
        </div>

        <div className="sp-step-badge">Step 2 of 2</div>
      </div>

      {/* Hero copy */}
      <div className="sp-hero">
        <div className="sp-org-pill">
          <span className="sp-org-avatar">{(orgName || 'O').charAt(0).toUpperCase()}</span>
          <span className="sp-org-name">{orgName || 'Your Organization'}</span>
        </div>
        <h1 className="sp-title">
          Choose your<br />
          <span className="sp-title-accent">workspace plan</span>
        </h1>
        <p className="sp-subtitle">
          Start free, scale as you grow. No credit card required for Free plan.
        </p>
      </div>

      {/* Plans grid */}
      <div className="sp-cards">
        {PLANS.map((plan) => {
          const isHovered = hovered === plan.id
          const isPopular = plan.badge === 'Most Popular'
          return (
            <div
              key={plan.id}
              className={`sp-card ${isHovered ? 'sp-card--active' : ''} ${isPopular ? 'sp-card--popular' : ''}`}
              style={{
                '--accent': plan.accentColor,
                '--grad-from': plan.gradientFrom,
                '--grad-to': plan.gradientTo,
              }}
              onMouseEnter={() => setHovered(plan.id)}
              onFocus={() => setHovered(plan.id)}
            >
              {plan.badge && (
                <div className="sp-badge">{plan.badge}</div>
              )}

              <div className="sp-card-top">
                <div className="sp-plan-icon">{plan.icon}</div>
                <div className="sp-plan-name">{plan.name}</div>
                <p className="sp-plan-tagline">{plan.tagline}</p>
              </div>

              <div className="sp-price-block">
                {plan.price === 0 ? (
                  <div className="sp-price">
                    <span className="sp-price-amount">Free</span>
                    <span className="sp-price-period">forever</span>
                  </div>
                ) : (
                  <div className="sp-price">
                    <span className="sp-price-currency">$</span>
                    <span className="sp-price-amount">{plan.price}</span>
                    <span className="sp-price-period">/ mo</span>
                  </div>
                )}
              </div>

              <div className="sp-divider" />

              <ul className="sp-features">
                {plan.features.map((f, i) => (
                  <li key={i} className={`sp-feature ${f.included ? 'sp-feature--on' : 'sp-feature--off'}`}>
                    <span className="sp-feature-icon">
                      {f.included ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="7" fill="var(--accent)" fillOpacity="0.15"/>
                          <path d="M4 7l2 2 4-4" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="7" fill="#ffffff08"/>
                          <path d="M5 9l4-4M9 9L5 5" stroke="#4a5568" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="sp-feature-text">{f.text}</span>
                  </li>
                ))}
              </ul>

              <button
                className="sp-cta-btn"
                onClick={() => handleChoose(plan)}
              >
                {plan.cta}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M7.5 4l3.5 3-3.5 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )
        })}
      </div>

      {/* Trust bar */}
      <div className="sp-trust">
        <span className="sp-trust-item">🔒 Secure payments via Stripe</span>
        <span className="sp-trust-sep">·</span>
        <span className="sp-trust-item">🔄 Cancel anytime</span>
        <span className="sp-trust-sep">·</span>
        <span className="sp-trust-item">💳 No hidden charges</span>
      </div>

      {/* Confirmation overlay */}
      {confirming && selected && (
        <div className="sp-confirm-overlay" onClick={() => setConfirming(false)}>
          <div className="sp-confirm-modal" onClick={e => e.stopPropagation()}>
            <div
              className="sp-confirm-icon"
              style={{ '--accent': selected.accentColor }}
            >
              {selected.icon}
            </div>
            <h3 className="sp-confirm-title">
              {selected.name === 'Free' ? 'Start for free?' : `Activate ${selected.name}?`}
            </h3>
            <p className="sp-confirm-desc">
              {selected.price === 0
                ? `You're starting with the Free plan for ${orgName}. You can upgrade anytime.`
                : `You're activating the ${selected.name} plan at $${selected.price}/month for ${orgName}.`}
            </p>
            <div className="sp-confirm-btns">
              <button className="sp-confirm-cancel" onClick={() => setConfirming(false)}>Cancel</button>
              <button
                className="sp-confirm-ok"
                style={{ '--accent': selected.accentColor }}
                onClick={handleConfirm}
              >
                Confirm & Continue →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
