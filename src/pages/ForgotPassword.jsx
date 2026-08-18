import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useRateLimit } from '../hooks/useRateLimit'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { attempt, blocked } = useRateLimit(3000)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!attempt()) {
      setError('Please wait a few seconds before requesting another reset link.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`
    })
    setLoading(false)
    if (error) setError(error.message)
    else setMessage('If an account uses this address, a password reset link will be sent.')
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Reset your password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={160} autoComplete="email" />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}
        <button type="submit" disabled={loading || blocked}>{loading ? 'Sending…' : blocked ? 'Please wait…' : 'Send reset link'}</button>
      </form>
      <p><Link to="/login">Back to login</Link></p>
    </div>
  )
}