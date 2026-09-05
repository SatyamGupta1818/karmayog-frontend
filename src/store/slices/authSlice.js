import { createSlice } from '@reduxjs/toolkit'
import { tokenStorage } from '../../apis/client'

function readStoredToken(getter) {
  try {
    return getter()
  } catch {
    return null
  }
}

const accessToken = readStoredToken(tokenStorage.getAccess)
const refreshToken = readStoredToken(tokenStorage.getRefresh)
const user = readStoredToken(tokenStorage.getUser)

const initialState = {
  user,
  accessToken,
  refreshToken,
  isAuthenticated: Boolean(accessToken),
  status: accessToken ? 'authenticated' : 'anonymous',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const payload = action.payload ?? {}

      state.user = payload.user ?? state.user
      state.accessToken = payload.accessToken ?? state.accessToken
      state.refreshToken = payload.refreshToken ?? state.refreshToken
      state.isAuthenticated = Boolean(state.accessToken)
      state.status = state.isAuthenticated ? 'authenticated' : 'anonymous'
      state.error = null
    },

    setUser(state, action) {
      state.user = action.payload
      state.error = null
    },

    clearAuth(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.status = 'anonymous'
      state.error = null
    },
  },
})

export const { setCredentials, setUser, clearAuth } = authSlice.actions

export const selectAuth = (state) => state.auth
export const selectCurrentUser = (state) => state.auth.user
export const selectAccessToken = (state) => state.auth.accessToken
export const selectRefreshToken = (state) => state.auth.refreshToken
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error

export default authSlice.reducer
