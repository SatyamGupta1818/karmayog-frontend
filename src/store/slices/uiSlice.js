/**
 * uiSlice.js
 *
 * Manages all UI state:
 * - Sidebar collapsed/expanded
 * - Which nav items are open (for nested menus)
 * - Active path tracking
 */

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarCollapsed: false,
  // Map of path → boolean for expanded nested menus
  expandedMenus: {},
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * Toggle the entire sidebar between collapsed and expanded.
     */
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
      // Collapse all open menus when sidebar collapses
      if (state.sidebarCollapsed) {
        state.expandedMenus = {}
      }
    },

    /**
     * Explicitly set sidebar state.
     * @param {boolean} action.payload - true = collapsed
     */
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload
    },

    /**
     * Toggle a nested menu open/closed by its path key.
     * @param {string} action.payload - the parent nav item path
     */
    toggleMenu(state, action) {
      const path = action.payload
      state.expandedMenus[path] = !state.expandedMenus[path]
    },

    /**
     * Set a menu to a specific open state.
     */
    setMenuOpen(state, action) {
      const { path, open } = action.payload
      state.expandedMenus[path] = open
    },
  },
})

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMenu,
  setMenuOpen,
} = uiSlice.actions

// Selectors
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed
export const selectExpandedMenus    = (state) => state.ui.expandedMenus
export const selectMenuOpen = (path) => (state) => !!state.ui.expandedMenus[path]

export default uiSlice.reducer
