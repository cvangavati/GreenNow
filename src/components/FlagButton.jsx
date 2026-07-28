import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function FlagButton({ contentType, contentId }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason.trim()) return
    setSubmitting(true)

    const { error } = await supabase.from('flags').insert({
      content_type: contentType,
      content_id: contentId,
      reported_by: user.id,
      reason: reason.trim()
    })

    setSubmitting(false)

    if (!error) {
      setDone(true)
      setOpen(false)
    }
  }

  if (done) {
    return <span className="flag-confirm">✓ Reported — thanks for helping keep this space safe.</span>
  }

  return (
    <div className="flag-shell">
      {!open ? (
        <button type="button" className="flag-trigger" onClick={() => setOpen(true)}>
          🚩 Report
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flag-form">
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Why are you reporting this?"
            required
          />
          <button type="submit" className="flag-submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Submit'}
          </button>
          <button type="button" className="flag-cancel" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  )
}