/**
 * ProtectedRoute.jsx
 *
 * Placeholder auth guard. Currently always allows access.
 *
 * TO ENABLE REAL AUTH:
 * 1. Create an authSlice with `isAuthenticated` state
 * 2. Replace `isAuthenticated = true` with `useSelector(selectIsAuthenticated)`
 * 3. The redirect to '/login' will kick in automatically
 */

import { Navigate } from 'react-router-dom'

// TODO: Replace with real auth check from Redux store
const isAuthenticated = true

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}
