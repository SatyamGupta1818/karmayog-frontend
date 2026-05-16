import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import authService from '../apis/services/auth/auth.service'
import {
  clearAuth,
  selectAccessToken,
  selectAuthError,
  selectAuthStatus,
  selectCurrentUser,
  selectIsAuthenticated,
  setCredentials,
  setUser,
} from '../store/slices/authSlice'

export default function useAuth() {
  const dispatch = useDispatch()

  const user = useSelector(selectCurrentUser)
  const accessToken = useSelector(selectAccessToken)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const status = useSelector(selectAuthStatus)
  const error = useSelector(selectAuthError)

  const completeLogin = useCallback((loginResponse) => {
    dispatch(setCredentials(loginResponse))
  }, [dispatch])

  const loadProfile = useCallback(async () => {
    const profile = await authService.getProfile()
    dispatch(setUser(profile))
    return profile
  }, [dispatch])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      dispatch(clearAuth())
    }
  }, [dispatch])

  return {
    user,
    accessToken,
    isAuthenticated,
    status,
    error,
    completeLogin,
    loadProfile,
    logout,
  }
}

export { useAuth }
