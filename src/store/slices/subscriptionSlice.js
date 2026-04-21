/**
 * subscriptionSlice.js
 * File: src/store/slices/subscriptionSlice.js
 *
 * Redux slice that holds the chosen subscription plan.
 * Consumed anywhere in the app to gate features.
 */

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  plan: null,       // null | { id, name, price, period, features, accentColor }
  chosenAt: null,   // ISO timestamp
}

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setPlan(state, action) {
      state.plan    = action.payload
      state.chosenAt = new Date().toISOString()
    },
    clearPlan(state) {
      state.plan    = null
      state.chosenAt = null
    },
  },
})

export const { setPlan, clearPlan } = subscriptionSlice.actions
export default subscriptionSlice.reducer

// Selectors
export const selectPlan      = (s) => s.subscription.plan
export const selectPlanId    = (s) => s.subscription.plan?.id ?? null
export const selectIsFreePlan = (s) => s.subscription.plan?.id === 'free'
