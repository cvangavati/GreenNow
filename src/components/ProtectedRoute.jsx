import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="auth-card" role="status" aria-live="polite">
          <h2>Preparing your workspace</h2>
          <p className="form-help-text">Just a moment while we get everything ready.</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}