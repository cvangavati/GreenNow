import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

const CAUSE_OPTIONS = ['ocean', 'beach', 'river', 'forest', 'urban', 'roadside']

export default function Profile() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [causeTags, setCauseTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const [createdEvents, setCreatedEvents] = useState([])
  const [attendedEvents, setAttendedEvents] = useState([])
  const [myPosts, setMyPosts] = useState([])

  useEffect(() => {
    if (user) loadAll()
  }, [user])

  async function loadAll() {
    setLoading(true)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setName(profileData.name || '')
      setLocation(profileData.location_text || '')
      setCauseTags(profileData.cause_tags || [])
    }

    const { data: created } = await supabase
      .from('events')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
    setCreatedEvents(created || [])

    const { data: rsvps } = await supabase
      .from('rsvps')
      .select('events(*)')
      .eq('user_id', user.id)
    setAttendedEvents((rsvps || []).map(r => r.events).filter(Boolean))

    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
    setMyPosts(posts || [])

    setLoading(false)
  }

  function toggleTag(tag) {
    setCauseTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const { error } = await supabase
      .from('profiles')
      .update({ name, location_text: location, cause_tags: causeTags })
      .eq('id', user.id)

    setSaving(false)
    setMessage(error ? error.message : 'Profile saved!')
  }

  if (loading) return <p style={{ padding: 40 }}>Loading profile...</p>

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: '0 16px' }}>
      <h2>Your Profile</h2>
      <form onSubmit={handleSave}>
        <div>
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div>
          <label>Location</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" style={{ width: '100%' }} />
        </div>
        <div>
          <label>Causes you care about</label>
          <div>
            {CAUSE_OPTIONS.map(tag => (
              <label key={tag} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={causeTags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                />
                {' '}{tag}
              </label>
            ))}
          </div>
        </div>
        {message && <p>{message}</p>}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <div style={{ marginTop: 32 }}>
        <h3>Events You Created ({createdEvents.length})</h3>
        {createdEvents.length === 0 && <p style={{ color: '#888' }}>You haven't posted any cleanup sites yet.</p>}
        {createdEvents.map(ev => (
          <div key={ev.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <Link to={`/events/${ev.id}`}>{ev.title}</Link>
            <span style={{ color: '#888', fontSize: '0.85rem' }}> — {ev.status}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Events You're Attending ({attendedEvents.length})</h3>
        {attendedEvents.length === 0 && <p style={{ color: '#888' }}>No RSVPs yet.</p>}
        {attendedEvents.map(ev => (
          <div key={ev.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <Link to={`/events/${ev.id}`}>{ev.title}</Link>
            <span style={{ color: '#888', fontSize: '0.85rem' }}> — {ev.status}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Your Posts ({myPosts.length})</h3>
        {myPosts.length === 0 && <p style={{ color: '#888' }}>You haven't shared anything yet.</p>}
        {myPosts.map(p => (
          <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <p style={{ margin: 0 }}>{p.content}</p>
            <span style={{ color: '#888', fontSize: '0.75rem' }}>{new Date(p.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}