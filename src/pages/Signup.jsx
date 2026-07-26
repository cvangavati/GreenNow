import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const { error } = await signUp(email, password, name)
    if (error) {
      setError(error.message || error.error_description || JSON.stringify(error))
    } else {
      navigate('/')
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2>Sign up for GreenNow</h2>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="signup-name">Name</label>
            <input
              id="signup-name"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'signup-error' : undefined}
            />
          </div>
          <div className="form-field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'signup-error' : undefined}
            />
          </div>
          <div className="form-field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'signup-error' : undefined}
            />
          </div>
          {error && (
            <p id="signup-error" className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="form-submit" type="submit">Sign Up</button>
        </form>
        <div className="auth-links">
          <span>Already have an account? <Link to="/login">Log in</Link></span>
        </div>
      </div>
    </div>
  )
}