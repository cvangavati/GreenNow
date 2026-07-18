import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

const STATUS_OPTIONS = ['reported', 'planned', 'in_progress', 'cleaned']
const STATUS_LABELS = {
  reported: 'Reported',
  planned: 'Planned',
  in_progress: 'In Progress',
  cleaned: 'Cleaned'
}
const STATUS_COLORS = {
  reported: '#c14848',
  planned: '#d98c2b',
  in_progress: '#3b5fc4',
  cleaned: '#2d9166'
}
const URGENCY_COLORS = {
  critical: '#c14848',
  high: '#d98c2b',
  medium: '#3b5fc4',
  low: '#6b7a72'
}

function Badge({ label, color }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      padding: '3px 9px',
      borderRadius: 20,
      background: color,
      color: 'white',
      marginRight: 6
    }}>
      {label}
    </span>
  )
}

export default function EventDetail() {
  const { id } = useParams()
  const { user } = useAuth()

  const [event, setEvent] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteLoading, setNoteLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setLoading(true)

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (eventError) {
      setError('Could not load this event.')
      setLoading(false)
      return
    }

    const { data: rsvpData } = await supabase
      .from('rsvps')
      .select('*')
      .eq('event_id', id)

    const { data: updateData, error: updateError } = await supabase
      .from('event_updates')
      .select('*, profiles(name)')
      .eq('event_id', id)
      .order('timestamp', { ascending: false })

    if (updateError) console.error('Update fetch error:', updateError)

    setEvent(eventData)
    setRsvps(rsvpData || [])
    setUpdates(updateData || [])
    setLoading(false)
  }

  const isGoing = rsvps.some(r => r.user_id === user?.id)

  async function toggleRsvp() {
    setRsvpLoading(true)

    if (isGoing) {
      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('event_id', id)
        .eq('user_id', user.id)
      if (error) setError(error.message)
    } else {
      const { error } = await supabase
        .from('rsvps')
        .insert({ event_id: id, user_id: user.id, status: 'going' })
      if (error) setError(error.message)
    }

    await fetchData()
    setRsvpLoading(false)
  }

  async function changeStatus(newStatus) {
    if (newStatus === event.status) return
    setStatusLoading(true)
    setError(null)

    const { error: updateEventError } = await supabase
      .from('events')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updateEventError) {
      setError(updateEventError.message)
      setStatusLoading(false)
      return
    }

    const { error: logError } = await supabase
      .from('event_updates')
      .insert({
        event_id: id,
        user_id: user.id,
        change_type: 'status_change',
        note: `Changed status to "${STATUS_LABELS[newStatus]}".`
      })

    if (logError) console.error('Log error:', logError)

    await fetchData()
    setStatusLoading(false)
  }

  async function submitNote(e) {
    e.preventDefault()
    if (!noteText.trim()) return
    setNoteLoading(true)
    setError(null)

    const { error: logError } = await supabase
      .from('event_updates')
      .insert({
        event_id: id,
        user_id: user.id,
        change_type: 'note',
        note: noteText.trim()
      })

    if (logError) setError(logError.message)
    else setNoteText('')

    await fetchData()
    setNoteLoading(false)
  }

  if (loading) return <p style={{ padding: 40 }}>Loading event...</p>
  if (error && !event) return <p style={{ padding: 40, color: 'red' }}>{error}</p>
  if (!event) return null

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      <p><Link to="/">&larr; Back to Bulletin</Link></p>

      <div style={{ marginBottom: 10 }}>
        <Badge label={STATUS_LABELS[event.status]} color={STATUS_COLORS[event.status]} />
        <Badge label={event.urgency} color={URGENCY_COLORS[event.urgency]} />
      </div>

      <h1 style={{ marginBottom: 4 }}>{event.title}</h1>
      <p style={{ color: '#555' }}>{event.description}</p>

      <p style={{ fontSize: '0.95rem' }}>
        📍 {event.address} &nbsp;·&nbsp; 📅 {new Date(event.date_time).toLocaleString()} &nbsp;·&nbsp; {event.type}
      </p>

      {event.photos?.[0] && (
        <img
          src={event.photos[0]}
          alt={event.title}
          style={{ maxWidth: '100%', borderRadius: 8, margin: '12px 0' }}
        />
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '20px 0',
        padding: '12px 16px',
        background: '#f0f4f2',
        borderRadius: 8
      }}>
        <span style={{ fontWeight: 600, color: '#2d9166' }}>
          {rsvps.length}/{event.volunteers_needed} volunteers signed up
        </span>
        <button onClick={toggleRsvp} disabled={rsvpLoading}>
          {rsvpLoading ? 'Updating...' : isGoing ? "Cancel RSVP" : "I'm Going"}
        </button>
      </div>

      <div style={{ margin: '20px 0' }}>
        <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: 6 }}>
          Status (anyone can update)
        </label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              disabled={statusLoading}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: s === event.status ? '2px solid #0f3d2e' : '1px solid #ccc',
                background: s === event.status ? '#0f3d2e' : 'white',
                color: s === event.status ? 'white' : 'black',
                cursor: 'pointer'
              }}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
        <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: 10 }}>
          Activity &amp; edit history
        </label>

        <form onSubmit={submitNote} style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          <input
            type="text"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Add a note or update..."
            style={{ flex: 1, padding: 8 }}
          />
          <button type="submit" disabled={noteLoading}>
            {noteLoading ? 'Posting...' : 'Post'}
          </button>
        </form>

        {updates.length === 0 && <p style={{ color: '#888' }}>No activity yet.</p>}

        {updates.map(u => (
          <div key={u.id} style={{ padding: '8px 0', borderBottom: '1px dashed #eee', fontSize: '0.85rem' }}>
            <strong>{u.profiles?.name || 'Someone'}</strong> — {u.note}
            <div style={{ color: '#999', fontSize: '0.75rem' }}>
              {new Date(u.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
    </div>
  )
}