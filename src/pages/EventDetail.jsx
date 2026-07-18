import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

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
  const [loading, setLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)
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

    const { data: rsvpData, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*')
      .eq('event_id', id)

    if (rsvpError) console.error('RSVP fetch error:', rsvpError)

    setEvent(eventData)
    setRsvps(rsvpData || [])
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

    await fetchData() // refresh live headcount
    setRsvpLoading(false)
  }

  if (loading) return <p style={{ padding: 40 }}>Loading event...</p>
  if (error && !event) return <p style={{ padding: 40, color: 'red' }}>{error}</p>
  if (!event) return null

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      <p><Link to="/">&larr; Back to Bulletin</Link></p>

      <div style={{ marginBottom: 10 }}>
        <Badge label={event.status.replace('_', ' ')} color={STATUS_COLORS[event.status]} />
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

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}