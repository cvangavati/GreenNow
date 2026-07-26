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
  const [sortBy, setSortBy] = useState('date')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false
    return !window.localStorage.getItem(ONBOARDING_KEY)
  })

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

  function dismissOnboarding() {
    setShowOnboarding(false)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ONBOARDING_KEY, 'true')
    }
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{
        border: '1px solid rgba(49, 102, 85, 0.16)',
        borderRadius: 24,
        padding: '20px 20px 16px',
        marginBottom: 20,
        background: 'linear-gradient(135deg, rgba(145, 200, 172, 0.2), rgba(92, 143, 177, 0.15))',
        boxShadow: '0 12px 30px rgba(21, 50, 61, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <p style={{ marginBottom: 6, fontWeight: 700, color: '#2f6b4d', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem' }}>
              Welcome to GreenNow
            </p>
            <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.7rem, 2.5vw, 2.3rem)' }}>Your local cleanup network, in one place.</h1>
            <p style={{ margin: 0, color: '#49655f', maxWidth: 620, lineHeight: 1.6 }}>
              Start by joining an active cleanup, reporting a site, or posting a new event so neighbors can help faster.
            </p>
          </div>
          {showOnboarding && (
            <button
              type="button"
              onClick={dismissOnboarding}
              style={{
                border: 'none',
                background: 'rgba(255,255,255,0.75)',
                padding: '8px 12px',
                borderRadius: 999,
                cursor: 'pointer',
                fontWeight: 600,
                color: '#2f6b4d'
              }}
            >
              Got it
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <Link to="/new-event" style={{ textDecoration: 'none', color: '#183b2c', background: 'white', padding: '10px 14px', borderRadius: 999, fontWeight: 700 }}>
            + Post a cleanup
          </Link>
          <Link to="/report-site" style={{ textDecoration: 'none', color: '#183b2c', background: 'rgba(255,255,255,0.72)', padding: '10px 14px', borderRadius: 999, fontWeight: 700 }}>
            Report a polluted site
          </Link>
        </div>
      </div>

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

      {loading && <p role="status">Loading events...</p>}
      {!loading && sorted.length === 0 && (
        <div style={{
          border: '1px dashed rgba(49, 102, 85, 0.28)',
          borderRadius: 20,
          padding: '22px',
          background: 'rgba(255,255,255,0.72)',
          color: '#49655f'
        }}>
          <h3 style={{ margin: '0 0 8px', color: '#234a38' }}>Nothing here yet — but your first cleanup can start now.</h3>
          <p style={{ marginBottom: 12 }}>
            Post a site, report an issue, or browse nearby actions to help your neighborhood take shape.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/new-event" style={{ textDecoration: 'none', color: '#183b2c', background: 'white', padding: '10px 14px', borderRadius: 999, fontWeight: 700 }}>
              Create the first event
            </Link>
            <Link to="/report-site" style={{ textDecoration: 'none', color: '#183b2c', background: 'rgba(255,255,255,0.82)', padding: '10px 14px', borderRadius: 999, fontWeight: 700 }}>
              Report a site
            </Link>
          </div>
        </div>
      )}

      {sorted.map(ev => (
        <div
          key={ev.id}
          className="page-card"
          style={{ padding: 14, marginBottom: 14 }}
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
              loading="lazy"
              decoding="async"
              style={{ maxWidth: '100%', marginTop: 8, borderRadius: 8 }}
            />
          )}
        </div>
      ))}
    </div>
  )
}