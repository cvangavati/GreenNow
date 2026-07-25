import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const TYPE_OPTIONS = ['ocean', 'beach', 'river', 'forest', 'urban', 'roadside']
const URGENCY_OPTIONS = ['low', 'medium', 'high', 'critical']

export default function ReportSite() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('beach')
  const [urgency, setUrgency] = useState('medium')
  const [photoFile, setPhotoFile] = useState(null)
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const markerRef = useRef(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const map = L.map('report-pin-map').setView([37.7749, -122.4194], 4)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    map.on('click', (e) => {
      setLat(e.latlng.lat)
      setLng(e.latlng.lng)
      if (markerRef.current) map.removeLayer(markerRef.current)
      markerRef.current = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map)
    })

    return () => map.remove()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!address.trim()) {
      setError('Please add a location for this report.')
      return
    }

    setSaving(true)

    let photoUrls = []

    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('event-photos')
        .upload(filePath, photoFile)

      if (uploadError) {
        setError('Photo upload failed: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('event-photos')
        .getPublicUrl(filePath)

      photoUrls = [urlData.publicUrl]
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        title: `Reported site: ${address.trim().slice(0, 40)}`,
        description: description.trim(),
        address: address.trim(),
        date_time: null,
        status: 'reported',
        type,
        urgency,
        created_by: user.id,
        volunteers_needed: 0,
        photos: photoUrls,
        lat,
        lng
      })
      .select()
      .single()

    setSaving(false)

    if (error) {
      setError(error.message || 'Something went wrong. Please try again.')
      return
    }

    await supabase.from('event_updates').insert({
      event_id: data.id,
      user_id: user.id,
      change_type: 'reported',
      note: 'Reported this site.'
    })

    navigate(`/events/${data.id}`)
  }

  return (
    <div style={{ maxWidth: 440, margin: '40px auto', padding: '0 16px' }}>
      <h2>Report a Polluted Site</h2>
      <p style={{ color: '#888', fontSize: '0.85rem' }}>
        Quick way to flag a site that needs cleaning. A volunteer or group can adopt it and schedule a cleanup later.
      </p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Location / address</label>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="e.g. Ocean Beach, San Francisco, CA"
            required
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label>Drop a pin on the map (optional but recommended)</label>
          <div id="report-pin-map" style={{ height: 250, width: '100%', borderRadius: 8, marginBottom: 4 }} />
          <p style={{ fontSize: '0.75rem', color: '#888' }}>
            {lat && lng ? `Pin set at ${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Click the map to drop a pin.'}
          </p>
        </div>

        <div>
          <label>What's the problem? (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label>Site type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label>Urgency</label>
          <select value={urgency} onChange={e => setUrgency(e.target.value)}>
            {URGENCY_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div>
          <label>Photo (optional but helpful)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setPhotoFile(e.target.files[0])}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  )
}