// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Protected Route
//  Guards routes based on auth + role
// ─────────────────────────────────────────────
import { Navigate } from 'react-router-dom'
import { useAuth }  from '../../context/AuthContext'

// Usage:
// <ProtectedRoute role="doctor">  → only doctors
// <ProtectedRoute role="patient"> → only patients
// <ProtectedRoute>                → any logged-in user

const ProtectedRoute = ({ children, role }) => {
  const { user, userProfile, loading } = useAuth()

  // Still checking auth state
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent
                        rounded-full animate-spin" />
        <p className="text-teal-700 font-medium font-sans">Loading RhinoGuide...</p>
      </div>
    </div>
  )

  // Not logged in → go to landing page
  if (!user) return <Navigate to="/" replace />

  // Role check
  if (role && userProfile?.role !== role) {
    // Doctor trying to access patient route → redirect to doctor app
    if (userProfile?.role === 'doctor') return <Navigate to="/doctor" replace />
    // Patient trying to access doctor route → redirect to patient app
    if (userProfile?.role === 'patient') return <Navigate to="/patient" replace />
    // Unknown role → back to landing
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute