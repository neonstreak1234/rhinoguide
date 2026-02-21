// ─────────────────────────────────────────────
//  RhinoGuide by Manish — App Router
// ─────────────────────────────────────────────
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth }         from './context/AuthContext'
import ProtectedRoute      from './components/shared/ProtectedRoute'

// Pages
import Landing             from './pages/Landing'
import DoctorApp           from './pages/DoctorApp'
import PatientApp          from './pages/PatientApp'

const App = () => {
  const { user, isDoctor, isPatient } = useAuth()

  return (
    <Routes>
      {/* ── Landing / Login page ── */}
      <Route
        path="/"
        element={
          // If already logged in, redirect to correct dashboard
          user
            ? isDoctor
              ? <Navigate to="/doctor" replace />
              : <Navigate to="/patient" replace />
            : <Landing />
        }
      />

      {/* ── Doctor routes — protected ── */}
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute role="doctor">
            <DoctorApp />
          </ProtectedRoute>
        }
      />

      {/* ── Patient routes — protected ── */}
      <Route
        path="/patient/*"
        element={
          <ProtectedRoute role="patient">
            <PatientApp />
          </ProtectedRoute>
        }
      />

      {/* ── Catch-all → Landing ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App