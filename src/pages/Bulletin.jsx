import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

const STATUS_OPTIONS = ['all', 'reported', 'planned', 'in_progress', 'cleaned']
const TYPE_OPTIONS = ['all', 'ocean', 'beach', 'river', 'forest', 'urban', 'roadside']
const URGENCY_OPTIONS = ['all', 'low', 'medium', 'high', 'critical']
const URGENCY_RANK = { critical: 0, high: 1, medium: 2, low: 3 }

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

export default function Bulletin() {
  const [events, setEvents] = useState([])
  const [rsvpCounts, setRsvpCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('date')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')

  useEffect(() => {
    async function fetchEvents() {
      const { data: eventsData, error: eventsError } = await supabase.from('events').select('*')
      if (eventsError) {
        console.error('Fetch error:', eventsError)
        setLoading(false)
        return
      }
      setEvents(eventsData)

      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .select('event_id')

      if (rsvpError) {
        console.error('RSVP fetch error:', rsvpError)
      } else {
        const counts = {}
        rsvpData.forEach(r => {
          counts[r.event_id] = (counts[r.event_id] || 0) + 1
        })
        setRsvpCounts(counts)
      }

      setLoading(false)
    }
    fetchEvents()
  }, [])

  const filtered = events
    .filter(ev => statusFilter === 'all' || ev.status === statusFilter)
    .filter(ev => typeFilter === 'all' || ev.type === typeFilter)
    .filter(ev => urgencyFilter === 'all' || ev.urgency === urgencyFilter)

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date') return new Date(a.date_time) - new Date(b.date_time)
    if (sortBy === 'status') return a.status.localeCompare(b.status)
    if (sortBy === 'urgency') return URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency]
    return 0
  })

  return (
    <div style={{ padding: '24px 16px', maxWidth: 800, margin: '0 auto' }}>
      <h1>Bulletin Board</h1>
      <p>
        <Link to="/new-event">+ Post a Cleanup Site</Link>
        {' '}·{' '}
        <Link to="/report-site">📸 Report a Polluted Site</Link>
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ flex: '1 1 140px' }}
        >
          <option value="date">Sort: Soonest date</option>
          <option value="status">Sort: Status</option>
          <option value="urgency">Sort: Urgency</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ flex: '1 1 140px' }}
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ flex: '1 1 140px' }}
        >
          {TYPE_OPTIONS.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>
          ))}
        </select>

        <select
          value={urgencyFilter}
          onChange={e => setUrgencyFilter(e.target.value)}
          style={{ flex: '1 1 140px' }}
        >
          {URGENCY_OPTIONS.map(u => (
            <option key={u} value={u}>{u === 'all' ? 'All urgency levels' : u}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading events...</p>}
      {!loading && sorted.length === 0 && <p>No events match these filters yet.</p>}

      {sorted.map(ev => (
        <div
          key={ev.id}
          style={{
            border: '1px solid #ccc',
            padding: 14,
            marginBottom: 14,
            borderRadius: 10
          }}
        >
          <div style={{ marginBottom: 6 }}>
            <Badge label={ev.status.replace('_', ' ')} color={STATUS_COLORS[ev.status]} />
            <Badge label={ev.urgency} color={URGENCY_COLORS[ev.urgency]} />
          </div>

          <h3 style={{ margin: '4px 0' }}>
            <Link to={`/events/${ev.id}`}>{ev.title}</Link>
          </h3>

          <p style={{ margin: '4px 0', color: '#555' }}>{ev.description}</p>

          <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
            📍 {ev.address} &nbsp;·&nbsp; 📅 {new Date(ev.date_time).toLocaleString()} &nbsp;·&nbsp; {ev.type}
          </p>

          <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#2d9166', fontWeight: 600 }}>
            {(rsvpCounts[ev.id] || 0)}/{ev.volunteers_needed} volunteers signed up
          </p>

          {ev.photos?.[0] && (
            <img
              src={ev.photos[0]}
              alt={ev.title}
              style={{ maxWidth: '100%', marginTop: 8, borderRadius: 8 }}
            />
          )}
        </div>
      ))}
    </div>
  )
}