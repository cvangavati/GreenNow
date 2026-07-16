import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Set a new password</h2>
      {success ? (
        <p style={{ color: 'green' }}>Password updated! Redirecting to login...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>New password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Update password</button>
        </form>
      )}
    </div>
  )
}