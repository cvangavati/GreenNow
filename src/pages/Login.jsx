import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmedEmail = email.trim()
    setError(null)

    if (!trimmedEmail || !password) {
      setError('Please enter both your email and password.')
      return
    }

    setLoading(true)
    const { error } = await signIn(trimmedEmail, password)
    setLoading(false)

    if (error) {
      setError(error.message || 'We could not sign you in. Please try again.')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2>Sign in to GreenNow</h2>
        <p className="form-help-text">Use the email and password you created for your account.</p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoCapitalize="none"
              inputMode="email"
              maxLength={160}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>
          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              maxLength={128}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>
          {error && (
            <p id="login-error" className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="auth-links">
          <span>New here? <Link to="/signup">Create an account</Link></span>
          <Link to="/forgot-password">Reset your password</Link>
        </div>
      </div>
    </div>
  )
}