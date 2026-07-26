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
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const [createdEvents, setCreatedEvents] = useState([])
  const [attendedEvents, setAttendedEvents] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [stats, setStats] = useState({ totalEventsAttended: 0, totalTrashLbs: 0, causesCount: 0, causesList: [] })
  const [badges, setBadges] = useState([])

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
      setLeaderboardOptIn(profileData.leaderboard_opt_in || false)
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
    const attended = (rsvps || []).map(r => r.events).filter(Boolean)
    setAttendedEvents(attended)

    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
    setMyPosts(posts || [])

    const totalEventsAttended = attended.length
    const totalTrashLbs = attended.reduce((sum, ev) => sum + (parseFloat(ev.trash_collected_lbs) || 0), 0)
      + (created || []).reduce((sum, ev) => {
          const alreadyCounted = attended.some(a => a.id === ev.id)
          return alreadyCounted ? sum : sum + (parseFloat(ev.trash_collected_lbs) || 0)
        }, 0)
    const causesInvolved = new Set([
      ...attended.map(ev => ev.type),
      ...(created || []).map(ev => ev.type)
    ])

    setStats({
      totalEventsAttended,
      totalTrashLbs,
      causesCount: causesInvolved.size,
      causesList: Array.from(causesInvolved)
    })

    const earnedBadges = []
    if (totalEventsAttended >= 1 || (created || []).length >= 1) {
      earnedBadges.push({ label: 'First Cleanup', icon: '🌱' })
    }
    if (totalEventsAttended >= 10) {
      earnedBadges.push({ label: '10 Events', icon: '🏅' })
    }
    if ((created || []).length >= 1) {
      earnedBadges.push({ label: 'Site Founder', icon: '📍' })
    }
    if (causesInvolved.size >= 3) {
      earnedBadges.push({ label: 'Multi-Cause Champion', icon: '🌍' })
    }
    if (totalTrashLbs >= 100) {
      earnedBadges.push({ label: '100 lbs Club', icon: '♻️' })
    }
    setBadges(earnedBadges)

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
      .update({ name, location_text: location, cause_tags: causeTags, leaderboard_opt_in: leaderboardOptIn })
      .eq('id', user.id)

    setSaving(false)
    setMessage(error ? error.message : 'Profile saved!')
  }

  if (loading) return <p style={{ padding: 40 }}>Loading profile...</p>

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: '0 16px' }}>
      <h2>Your Profile</h2>
      <p><Link to="/get-verified">Apply for organization verification</Link></p>
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
        <div style={{ marginTop: 10 }}>
          <label>
            <input
              type="checkbox"
              checked={leaderboardOptIn}
              onChange={e => setLeaderboardOptIn(e.target.checked)}
            />
            {' '}Show me on the public leaderboard
          </label>
        </div>
        {message && <p>{message}</p>}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <div style={{
        marginTop: 32,
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1 1 140px', background: '#f0f8f4', borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2d9166' }}>{stats.totalEventsAttended}</div>
          <div style={{ fontSize: '0.8rem', color: '#555' }}>Events Attended</div>
        </div>
        <div style={{ flex: '1 1 140px', background: '#f0f8f4', borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2d9166' }}>{stats.totalTrashLbs}</div>
          <div style={{ fontSize: '0.8rem', color: '#555' }}>Lbs Trash Collected</div>
        </div>
        <div style={{ flex: '1 1 140px', background: '#f0f8f4', borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2d9166' }}>{stats.causesCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#555' }}>
            Causes Supported{stats.causesList.length > 0 && ` (${stats.causesList.join(', ')})`}
          </div>
        </div>
      </div>

      {badges.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Badges</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {badges.map(b => (
              <div key={b.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#fff3e0',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                <span>{b.icon}</span> {b.label}
              </div>
            ))}
          </div>
        </div>
      )}

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