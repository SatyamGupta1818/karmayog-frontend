/**
 * App.jsx
 * Root application component.
 * BrowserRouter is provided here; Redux Provider is in main.jsx.
 */

import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
