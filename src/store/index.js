/**
 * store/index.js
 * File: src/store/index.js
 *
 * Redux store — add subscriptionReducer alongside existing slices.
 */

import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    ui: uiReducer,
    subscription: subscriptionReducer,
    auth: authReducer,
  },
})

export default store
