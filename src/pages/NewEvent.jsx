import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

const TYPE_OPTIONS = ['ocean', 'beach', 'river', 'forest', 'urban', 'roadside']
const URGENCY_OPTIONS = ['low', 'medium', 'high', 'critical']

export default function NewEvent() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [type, setType] = useState('beach')
  const [urgency, setUrgency] = useState('medium')
  const [volunteersNeeded, setVolunteersNeeded] = useState(5)
  const [photoFile, setPhotoFile] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !address.trim() || !dateTime) {
      setError('Please fill in title, address, and date/time.')
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
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        date_time: dateTime,
        status: 'reported',
        type,
        urgency,
        created_by: user.id,
        volunteers_needed: parseInt(volunteersNeeded) || 1,
        photos: photoUrls
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
      change_type: 'created',
      note: 'Created this event.'
    })

    navigate(`/events/${data.id}`)
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto' }}>
      <h2>Post a Cleanup Site</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label>Address / Location</label>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="e.g. Ocean Beach, San Francisco, CA"
            required
          />
        </div>

        <div>
          <label>Date &amp; time</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={e => setDateTime(e.target.value)}
            required
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
          <label>Volunteers needed</label>
          <input
            type="number"
            min="1"
            value={volunteersNeeded}
            onChange={e => setVolunteersNeeded(e.target.value)}
          />
        </div>

        <div>
          <label>Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setPhotoFile(e.target.files[0])}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? 'Posting...' : 'Post to Board'}
        </button>
      </form>
    </div>
  )
}