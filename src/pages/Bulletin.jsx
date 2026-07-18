import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function Bulletin() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase.from('events').select('*')
      if (error) console.error('Fetch error:', error)
      else setEvents(data)
      setLoading(false)
    }
    fetchEvents()
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <h1>Bulletin Board</h1>
      <p><Link to="/new-event">+ Post a Cleanup Site</Link></p>

      {loading && <p>Loading events...</p>}
      {!loading && events.length === 0 && <p>No events yet.</p>}

      {events.map(ev => (
        <div key={ev.id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12, borderRadius: 8 }}>
          <h3>
            <Link to={`/events/${ev.id}`}>{ev.title}</Link>
          </h3>
          <p>{ev.description}</p>
          <p><strong>{ev.address}</strong> — {ev.status} — {ev.type} — {ev.urgency}</p>
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