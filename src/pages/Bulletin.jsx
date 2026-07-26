import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

const ONBOARDING_KEY = 'greennow-bulletin-onboarding-seen'

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
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('date')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false
    return !window.localStorage.getItem(ONBOARDING_KEY)
  })

  async function fetchEvents() {
    setLoading(true)
    setError(null)

    const [eventsResult, rsvpsResult] = await Promise.all([
      supabase
        .from('events')
        .select('id,title,address,date_time,status,type,urgency,volunteers_needed,description,photos')
        .order('date_time', { ascending: true }),
      supabase
        .from('rsvps')
        .select('event_id')
    ])

    const { data: eventsData, error: eventsError } = eventsResult
    if (eventsError) {
      console.error('Fetch error:', eventsError)
      setError('We could not load cleanup events right now. Please try again in a moment.')
      setLoading(false)
      return
    }

    setEvents(Array.isArray(eventsData) ? eventsData : [])

    const { data: rsvpData, error: rsvpError } = rsvpsResult
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

  useEffect(() => {
    fetchEvents()
  }, [])

  const filtered = events
    .filter(ev => statusFilter === 'all' || ev.status === statusFilter)
    .filter(ev => typeFilter === 'all' || ev.type === typeFilter)
    .filter(ev => urgencyFilter === 'all' || ev.urgency === urgencyFilter)

  const sorted = [...filtered].sort((a, b) => {
    const dateA = Date.parse(a.date_time || '')
    const dateB = Date.parse(b.date_time || '')

    if (sortBy === 'date') {
      if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0
      if (Number.isNaN(dateA)) return 1
      if (Number.isNaN(dateB)) return -1
      return dateA - dateB
    }

    if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '')
    if (sortBy === 'urgency') return (URGENCY_RANK[a.urgency] ?? 99) - (URGENCY_RANK[b.urgency] ?? 99)
    return 0
  })

  function dismissOnboarding() {
    setShowOnboarding(false)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ONBOARDING_KEY, 'true')
    }
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: 860, margin: '0 auto' }}>
      <section className="hero-panel">
        <div className="hero-panel__copy">
          <p className="hero-panel__eyebrow">Welcome to GreenNow</p>
          <h1>Find cleanups, share sites, and mobilize your block.</h1>
          <p className="hero-panel__lead">
            Browse local action, join an event, or post a new cleanup so neighbors can step in quickly.
          </p>
          <div className="hero-actions">
            <Link className="action-link action-link--primary" to="/new-event">Plan a cleanup</Link>
            <Link className="action-link action-link--secondary" to="/report-site">Report a site</Link>
          </div>
        </div>
        <div className="hero-panel__aside">
          <div className="hero-panel__stat">
            <strong>Weekly momentum</strong>
            <span>Neighbors are turning overlooked places into shared care.</span>
          </div>
          <div className="hero-panel__stat">
            <strong>Low-friction action</strong>
            <span>Share a site, gather volunteers, and keep the work visible.</span>
          </div>
        </div>
        {showOnboarding && (
          <button
            type="button"
            onClick={dismissOnboarding}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              border: 'none',
              background: 'rgba(255,255,255,0.78)',
              padding: '8px 12px',
              borderRadius: 999,
              cursor: 'pointer',
              fontWeight: 600,
              color: '#2f6b4d'
            }}
          >
            Thanks, got it
          </button>
        )}
      </section>

      <div className="filter-shell">
        <div className="filter-field">
          <label className="filter-label" htmlFor="sort-by">Sort</label>
          <select id="sort-by" className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date">Soonest date</option>
            <option value="status">Status</option>
            <option value="urgency">Urgency</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label" htmlFor="status-filter">Status</label>
          <select id="status-filter" className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label" htmlFor="type-filter">Type</label>
          <select id="type-filter" className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            {TYPE_OPTIONS.map(t => (
              <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label" htmlFor="urgency-filter">Urgency</label>
          <select id="urgency-filter" className="filter-select" value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)}>
            {URGENCY_OPTIONS.map(u => (
              <option key={u} value={u}>{u === 'all' ? 'All urgency levels' : u}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="state-banner" role="alert">
          {error} <button type="button" className="notification-action" onClick={fetchEvents}>Try again</button>
        </p>
      )}
      {loading && <p role="status" className="state-banner state-banner--info">Loading nearby cleanup events…</p>}
      {!loading && sorted.length === 0 && (
        <div className="empty-state">
          <h3>No cleanup events match your filters yet.</h3>
          <p style={{ marginTop: 8 }}>
            Try a broader search or create the first event for your area so others can join in.
          </p>
          <div className="hero-actions" style={{ marginTop: 12 }}>
            <Link className="action-link action-link--primary" to="/new-event">Create the first event</Link>
            <Link className="action-link action-link--secondary" to="/report-site">Report a site</Link>
          </div>
        </div>
      )}

      {sorted.map(ev => (
        <article key={ev.id} className="event-card">
          <div className="event-card__badges">
            <Badge label={ev.status.replace('_', ' ')} color={STATUS_COLORS[ev.status]} />
            <Badge label={ev.urgency} color={URGENCY_COLORS[ev.urgency]} />
          </div>

          <h3 className="event-card__title">
            <Link to={`/events/${ev.id}`}>{ev.title?.trim() || 'Untitled cleanup'}</Link>
          </h3>

          <p className="event-card__description">{ev.description?.trim() || 'No description provided yet.'}</p>

          <div className="event-card__meta">
            <span>📍 {ev.address?.trim() || 'Location shared soon'}</span>
            <span>📅 {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ev.date_time))}</span>
            <span>{ev.type?.trim() || 'General cleanup'}</span>
          </div>

          <div className="event-card__footer">
            <span>{(rsvpCounts[ev.id] || 0)}/{Number(ev.volunteers_needed) || 0} volunteers signed up</span>
            <Link to={`/events/${ev.id}`}>Open details</Link>
          </div>

          {ev.photos?.[0] && (
            <img
              className="event-card__image"
              src={ev.photos[0]}
              alt={ev.title}
              loading="lazy"
              decoding="async"
            />
          )}
        </article>
      ))}
    </div>
  )
}