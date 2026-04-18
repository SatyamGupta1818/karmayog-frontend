/**
 * Redux Store
 *
 * Central store combining all slices.
 * Add new slice reducers here as the app grows.
 */

import { configureStore } from '@reduxjs/toolkit'
import uiReducer from './slices/uiSlice'
// import authReducer from './slices/authSlice'  ← add future slices here

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    // auth: authReducer,
  },
})

export default store
