import { useEffect, useRef, useState } from 'react'
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
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(null)
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerLayerRef = useRef(null)
  const leafletRef = useRef(null)

  useEffect(() => {
    fetchEvents()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  async function fetchEvents() {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('id,title,address,status,lat,lng')
      .not('lat', 'is', null)
      .not('lng', 'is', null)

    if (error) {
      console.error('Fetch error:', error)
      setMapError('We could not load the map data right now. Please try again in a moment.')
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }

  async function loadMap() {
    if (mapReady) return

    try {
      const [{ default: Leaflet }] = await Promise.all([
        import('leaflet'),
        import('leaflet/dist/leaflet.css')
      ])

      leafletRef.current = Leaflet
      if (!mapContainerRef.current) return

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      const map = Leaflet.map(mapContainerRef.current).setView([37.7749, -122.4194], 4)
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      markerLayerRef.current = Leaflet.layerGroup().addTo(map)
      mapInstanceRef.current = map
      setMapReady(true)
      setMapError(null)
    } catch (err) {
      console.error('Could not load map:', err)
      setMapError('The interactive map could not be loaded. Please try again.')
    }
  }

  useEffect(() => {
    if (!mapReady || !leafletRef.current || !mapInstanceRef.current) return

    const filtered = showUnclaimedOnly
      ? events.filter(ev => ev.status === 'reported')
      : events

    markerLayerRef.current?.clearLayers()

    filtered.forEach(ev => {
      const marker = leafletRef.current.circleMarker([ev.lat, ev.lng], {
        radius: 9,
        color: STATUS_COLORS[ev.status] || '#888',
        fillColor: STATUS_COLORS[ev.status] || '#888',
        fillOpacity: 0.85,
        weight: 2
      }).addTo(markerLayerRef.current)

      marker.bindPopup(
        `<strong>${ev.title}</strong><br>${ev.address}<br>Status: ${ev.status}<br><a href="/events/${ev.id}">View details</a>`
      )
    })
  }, [mapReady, events, showUnclaimedOnly])

  return (
    <div style={{ padding: '24px 16px', maxWidth: 900, margin: '0 auto' }}>
      <h1>Map View</h1>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', marginBottom: 12, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={showUnclaimedOnly}
          onChange={e => setShowUnclaimedOnly(e.target.checked)}
        />
        <span>Show only unclaimed reports</span>
      </label>

      {loading && <p>Loading map data…</p>}
      {mapError && <p className="form-error" role="alert">{mapError}</p>}

      {!mapReady ? (
        <div className="empty-state" style={{ marginBottom: 12 }}>
          <h3>Interactive map is ready to load</h3>
          <p style={{ marginTop: 8 }}>
            This keeps the first page load light and only brings in the map bundle when you want it.
          </p>
          <button className="action-link action-link--primary" type="button" onClick={loadMap} style={{ marginTop: 12 }}>
            Load interactive map
          </button>
        </div>
      ) : null}

      <div ref={mapContainerRef} style={{ height: 500, width: '100%', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }} />

      <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 8 }}>
        Note: only events with a location pin (lat/lng) appear on the map. Events created before map pins were added will only show on the list-based Bulletin.
      </p>
    </div>
  )
}
