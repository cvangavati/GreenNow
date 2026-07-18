import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { Link } from 'react-router-dom'

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
      <Link to="/new-event">+ Post a Cleanup Site</Link>
      {loading && <p>Loading events...</p>}
      {!loading && events.length === 0 && <p>No events yet.</p>}
      {events.map(ev => (
        <div key={ev.id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12, borderRadius: 8 }}>
          <h3>{ev.title}</h3>
          <p>{ev.description}</p>
          <p><strong>{ev.address}</strong> — {ev.status} — {ev.type} — {ev.urgency}</p>
        </div>
      ))}
    </div>
  )
}