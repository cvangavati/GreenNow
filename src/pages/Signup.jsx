import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRateLimit } from '../hooks/useRateLimit'
import { useFormGuard } from '../hooks/useFormGuard'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { attempt, blocked } = useRateLimit(3000)
  const { website, setWebsite, validateSubmission } = useFormGuard()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || !trimmedEmail || !password) {
      setError('Please fill in your name, email, and password before continuing.')
      return
    }

    const guardError = validateSubmission()
    if (guardError) {
      setError(guardError)
      return
    }

    if (!attempt()) {
      setError('Please wait a few seconds before trying again.')
      return
    }

    setLoading(true)
    try {
      const { error } = await signUp(trimmedEmail, password, trimmedName)
      if (error) {
        setError(error.message || error.error_description || JSON.stringify(error))
      } else {
        navigate('/thank-you?kind=account')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2>Create your GreenNow account</h2>
        <p className="form-help-text">Join to plan cleanups, share local issues, and connect with nearby volunteers.</p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="honeypot-field" aria-hidden="true">
            <label htmlFor="signup-website">Website</label>
            <input
              id="signup-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={e => setWebsite(e.target.value)}
            />
          </div>
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
          <button className="form-submit" type="submit" disabled={loading || blocked}>
            {loading ? 'Creating account…' : blocked ? 'Please wait…' : 'Create account'}
          </button>
        </form>
        <div className="auth-links">
          <span>Already have an account? <Link to="/login">Sign in</Link></span>
        </div>
      </div>
    </div>
  )
}