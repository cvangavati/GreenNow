import { useState, useEffect } from 'react'
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

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setName(data.name || '')
        setLocation(data.location_text || '')
        setCauseTags(data.cause_tags || [])
      }
      setLoading(false)
    }
    if (user) loadProfile()
  }, [user])

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

  if (loading) return <p>Loading profile...</p>

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Your Profile</h2>
      <form onSubmit={handleSave}>
        <div>
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label>Location</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" />
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
    </div>
  )
}