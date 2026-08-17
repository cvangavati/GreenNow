import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useFormGuard } from '../hooks/useFormGuard'

const CATEGORIES = [
  { value: 'general', label: 'General feedback' },
  { value: 'feature', label: 'Feature idea' },
  { value: 'issue', label: 'Something is not working' },
  { value: 'accessibility', label: 'Accessibility improvement' },
  { value: 'safety_privacy', label: 'Safety or privacy concern' }
]

const MAX_MESSAGE_LENGTH = 3000

export default function Feedback() {
  const { user } = useAuth()
  const { website, setWebsite, validateSubmission } = useFormGuard({ minSubmitTimeMs: 1200 })
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ type: '', message: '' })

    const guardMessage = validateSubmission()
    if (guardMessage) {
      setStatus({ type: 'error', message: guardMessage })
      return
    }

    const trimmedMessage = message.trim()
    const trimmedEmail = contactEmail.trim()

    if (trimmedMessage.length < 20) {
      setStatus({ type: 'error', message: 'Please share at least 20 characters so we can understand your suggestion.' })
      return
    }

    if (!privacyAcknowledged) {
      setStatus({ type: 'error', message: 'Please acknowledge the privacy policy before submitting feedback.' })
      return
    }

    setSubmitting(true)

    const { error } = await supabase
      .from('feedback')
      .insert({
        user_id: user?.id ?? null,
        category,
        message: trimmedMessage,
        contact_email: trimmedEmail || null,
        page_url: window.location.href
      })

    setSubmitting(false)

    if (error) {
      const setupMessage = error.code === '42P01'
        ? 'Feedback collection is being set up. Please try again shortly.'
        : 'We could not submit your feedback. Please try again.'
      setStatus({ type: 'error', message: setupMessage })
      return
    }

    setMessage('')
    setContactEmail('')
    setPrivacyAcknowledged(false)
    setStatus({ type: 'success', message: 'Thank you. Your feedback has been submitted.' })
  }

  return (
    <section className="public-page feedback-page" aria-labelledby="feedback-title">
      <p className="public-page__eyebrow">Shape GreenNow</p>
      <h1 id="feedback-title">How can we improve?</h1>
      <p className="public-page__lead">
        Tell us what would make GreenNow clearer, safer, more useful, or more accessible. You can submit feedback without an account.
      </p>

      <form className="feedback-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group honeypot-field" aria-hidden="true">
          <label htmlFor="feedback-website">Website</label>
          <input
            id="feedback-website"
            type="text"
            name="website"
            value={website}
            onChange={event => setWebsite(event.target.value)}
            tabIndex="-1"
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label htmlFor="feedback-category">What is this about?</label>
          <select id="feedback-category" value={category} onChange={event => setCategory(event.target.value)}>
            {CATEGORIES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="feedback-message">Your feedback</label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={event => setMessage(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            minLength="20"
            maxLength={MAX_MESSAGE_LENGTH}
            rows="7"
            required
            aria-describedby="feedback-message-help"
            placeholder="Describe what happened, what you expected, and how we could improve."
          />
          <p id="feedback-message-help" className="form-helper">{message.length}/{MAX_MESSAGE_LENGTH} characters. Please do not include passwords or other sensitive information.</p>
        </div>

        <div className="form-group">
          <label htmlFor="feedback-email">Email for follow-up <span className="optional-label">(optional)</span></label>
          <input
            id="feedback-email"
            type="email"
            value={contactEmail}
            onChange={event => setContactEmail(event.target.value)}
            maxLength="254"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <label className="consent-check" htmlFor="feedback-privacy">
          <input
            id="feedback-privacy"
            type="checkbox"
            checked={privacyAcknowledged}
            onChange={event => setPrivacyAcknowledged(event.target.checked)}
            required
          />
          <span>I understand that my submission will be handled under the <Link to="/privacy">GreenNow privacy policy</Link>.</span>
        </label>

        {status.message && (
          <p className={`form-status form-status--${status.type}`} role="status" aria-live="polite">{status.message}</p>
        )}

        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Sending feedback…' : 'Send feedback'}
        </button>
      </form>
    </section>
  )
}
