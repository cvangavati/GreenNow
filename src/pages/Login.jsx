import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2>Log in to GreenNow</h2>
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
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>
          {error && (
            <p id="login-error" className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="form-submit" type="submit">Log In</button>
        </form>
        <div className="auth-links">
          <span>Don't have an account? <Link to="/signup">Sign up</Link></span>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </div>
    </div>
  )
}