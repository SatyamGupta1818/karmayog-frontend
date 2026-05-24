import { Building2, CheckCircle2, CreditCard, Crown } from 'lucide-react'

const toneClasses = {
  amber: 'border-amber-100 bg-amber-50 text-amber-600',
  emerald: 'border-emerald-100 bg-emerald-50 text-emerald-600',
  blue: 'border-blue-100 bg-blue-50 text-blue-600',
  violet: 'border-violet-100 bg-violet-50 text-violet-600',
}

export default function OrganizationSummary({
  organizationCount,
  activeCount,
  subscribedCount,
  premiumCount,
}) {
  const cards = [
    { label: 'Organizations', value: organizationCount, icon: Building2, tone: 'amber' },
    { label: 'Active', value: activeCount, icon: CheckCircle2, tone: 'emerald' },
    { label: 'Subscribed', value: subscribedCount, icon: CreditCard, tone: 'blue' },
    { label: 'Premium', value: premiumCount, icon: Crown, tone: 'violet' },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <div
            key={card.label}
            className="rounded-2xl border border-surface-200 bg-white px-5 py-4 shadow-card"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-ink">{card.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${toneClasses[card.tone]}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
