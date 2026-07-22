import { useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../services/supabaseClient'

const STATUS_COLORS = {
  reported: '#c14848',
  planned: '#d98c2b',
  in_progress: '#3b5fc4',
  cleaned: '#2d9166'
}

export default function MapView() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUnclaimedOnly, setShowUnclaimedOnly] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .not('lat', 'is', null)
      .not('lng', 'is', null)

    if (error) console.error('Fetch error:', error)
    else setEvents(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (loading) return

    const map = L.map('leaflet-map').setView([37.7749, -122.4194], 4)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const filtered = showUnclaimedOnly
      ? events.filter(ev => ev.status === 'reported')
      : events

    filtered.forEach(ev => {
      const marker = L.circleMarker([ev.lat, ev.lng], {
        radius: 9,
        color: STATUS_COLORS[ev.status] || '#888',
        fillColor: STATUS_COLORS[ev.status] || '#888',
        fillOpacity: 0.85,
        weight: 2
      }).addTo(map)

      marker.bindPopup(
        `<strong>${ev.title}</strong><br>${ev.address}<br>Status: ${ev.status}<br><a href="/events/${ev.id}">View details</a>`
      )
    })

    return () => map.remove()
  }, [loading, events, showUnclaimedOnly])

  return (
    <div style={{ padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <h1>Map View</h1>
      <label style={{ display: 'block', marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={showUnclaimedOnly}
          onChange={e => setShowUnclaimedOnly(e.target.checked)}
        />
        {' '}Show only unclaimed reports
      </label>

      {loading && <p>Loading map...</p>}

      <div id="leaflet-map" style={{ height: 500, width: '100%', borderRadius: 10 }} />

      <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 8 }}>
        Note: only events with a location pin (lat/lng) appear on the map. Events created before map pins were added will only show on the list-based Bulletin.
      </p>
    </div>
  )
}
