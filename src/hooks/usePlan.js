/**
 * usePlan.js
 * File: src/hooks/usePlan.js
 *
 * Convenience hook for reading subscription state and gating features.
 *
 * Usage:
 *   const { plan, isPro, isPremium, isFree, canUseFeature } = usePlan()
 *
 *   // Gate a feature:
 *   if (!canUseFeature('api_access')) {
 *     return <UpgradePrompt />
 *   }
 */

import { useSelector } from 'react-redux'
import { selectPlan, selectPlanId } from '../store/slices/subscriptionSlice'

// Feature matrix per plan
const FEATURE_ACCESS = {
  free: [
    'basic_tasks',
    'up_to_5_members',
    '3_projects',
    '1gb_storage',
    'community_support',
  ],
  premium: [
    'basic_tasks',
    'advanced_tasks',
    'up_to_50_members',
    'unlimited_projects',
    '50gb_storage',
    'email_support',
    'advanced_analytics',
    'custom_roles',
    'api_access',
  ],
  pro: [
    'basic_tasks',
    'advanced_tasks',
    'unlimited_members',
    'unlimited_projects',
    'unlimited_storage',
    'priority_support',
    'advanced_analytics',
    'custom_roles',
    'api_access',
    'webhooks',
    'sso_saml',
    'bi_reports',
  ],
}

export default function usePlan() {
  const plan   = useSelector(selectPlan)
  const planId = useSelector(selectPlanId)

  const canUseFeature = (featureKey) => {
    if (!planId) return false
    return (FEATURE_ACCESS[planId] ?? []).includes(featureKey)
  }

  return {
    plan,
    planId,
    isFree:    planId === 'free',
    isPremium: planId === 'premium',
    isPro:     planId === 'pro',
    canUseFeature,
    featureList: FEATURE_ACCESS[planId] ?? [],
  }
}
