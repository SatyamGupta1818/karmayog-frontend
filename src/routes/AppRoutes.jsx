/**
 * AppRoutes.jsx
 *
 * Integrated Version:
 * 1. Handles Public routes (/onboarding, /login) without layout.
 * 2. Handles Protected routes dynamically from routeConfig.
 * 3. Wraps protected pages in <ProtectedRoute> and <Layout>.
 */

import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { routeConfig } from './routeConfig'

// Layout & Security Components
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/common/ProtectedRoute'
import PageLoader from '../components/ui/PageLoader'

// Public Pages (Lazy Loaded)
const Onboarding = lazy(() => import('../pages/onboarding'))
const Auth = lazy(() => import('../pages/auth'))

/**
 * Recursively renders route config entries from routeConfig.js
 */
function renderRoutes(routes) {
  return routes.map((route) => {
    const Element = route.element

    if (route.children) {
      return (
        <Route key={route.path} path={route.path}>
          {Element && (
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <Element />
                </Suspense>
              }
            />
          )}
          {renderRoutes(route.children)}
        </Route>
      )
    }

    return (
      <Route
        key={route.path}
        path={route.path}
        element={
          <Suspense fallback={<PageLoader />}>
            <Element />
          </Suspense>
        }
      />
    )
  })
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── PUBLIC ROUTES ────────────────────────────────────────── */}
        {/* These do NOT have the sidebar/header or auth checks */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Auth />} />

        {/* ── REDIRECTS ────────────────────────────────────────────── */}
        {/* Initial landing goes to onboarding */}
        <Route path="/" element={<Navigate to="/onboarding" replace />} />

        {/* ── PROTECTED ROUTES ─────────────────────────────────────── */}
        {/* These require auth and use the main App Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {renderRoutes(routeConfig)}
        </Route>

        {/* ── 404 FALLBACK ─────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    </Suspense>
  )
}