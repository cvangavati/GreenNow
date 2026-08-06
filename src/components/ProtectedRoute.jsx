import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const [banned, setBanned] = useState(false)
  const [checkingBan, setCheckingBan] = useState(true)

  useEffect(() => {
    async function checkBan() {
      if (!user) {
        setCheckingBan(false)
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('banned')
        .eq('id', user.id)
        .single()
      setBanned(data?.banned || false)
      setCheckingBan(false)
    }
    checkBan()
  }, [user])

  if (loading || checkingBan) return <p className="page-shell">Loading...</p>
  if (!user) return <Navigate to="/login" replace />

  if (banned) {
    return (
      <div className="page-shell">
        <div className="page-card">
          <h2>Account Suspended</h2>
          <p>
            Your account has been suspended due to a violation of community guidelines.
            If you believe this is a mistake, please contact the GreenNow team.
          </p>
        </div>
      </div>
    )
  }

  return children
}