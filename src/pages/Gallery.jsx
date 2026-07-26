import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function Gallery() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGallery()
  }, [])

  async function fetchGallery() {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'cleaned')
      .not('after_photo_url', 'is', null)
      .order('updated_at', { ascending: false })

    if (error) console.error('Fetch error:', error)
    else setEvents(data || [])
    setLoading(false)
  }

  const totalLbs = events.reduce((sum, ev) => sum + (parseFloat(ev.trash_collected_lbs) || 0), 0)

  return (
    <div style={{ padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <h1>Impact gallery</h1>
      <p style={{ color: '#555' }}>
        See the places the GreenNow community has cleaned and the waste that has been removed.{' '}
        {events.length} sites are featured so far, with {totalLbs} lbs of trash removed.
      </p>

      {loading && <p role="status">Loading recent cleanups…</p>}
      {!loading && events.length === 0 && (
        <p style={{ color: '#888' }}>No completed cleanups with photos are available yet. Check back soon for progress updates.</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {events.map(ev => (
          <div key={ev.id} style={{ border: '1px solid #ccc', borderRadius: 10, padding: 14 }}>
            <h3 style={{ margin: '0 0 8px' }}>
              <Link to={`/events/${ev.id}`}>{ev.title}</Link>
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#888', margin: '0 0 10px' }}>
              📍 {ev.address}
              {ev.trash_collected_lbs && <> &nbsp;·&nbsp; ♻️ {ev.trash_collected_lbs} lbs collected</>}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {ev.photos?.[0] && (
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: '0 0 4px' }}>Before</p>
                  <img src={ev.photos[0]} alt="Before" style={{ width: '100%', borderRadius: 6 }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: '0 0 4px' }}>After</p>
                <img src={ev.after_photo_url} alt="After" style={{ width: '100%', borderRadius: 6 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}