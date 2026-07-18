import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function CreateGroup() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [region, setRegion] = useState('')
  const [causeFocus, setCauseFocus] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please give your group a name.')
      return
    }
    setSaving(true)
    setError(null)

    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: name.trim(),
        description: description.trim(),
        region: region.trim(),
        cause_focus: causeFocus.trim(),
        created_by: user.id
      })
      .select()
      .single()

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    await supabase.from('group_members').insert({ group_id: data.id, user_id: user.id })

    navigate(`/groups/${data.id}`)
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 16px' }}>
      <h2>Create a Group</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Group name</label>
          <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label>Region</label>
          <input
            value={region}
            onChange={e => setRegion(e.target.value)}
            placeholder="e.g. Bay Area, CA"
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label>Cause focus</label>
          <input
            value={causeFocus}
            onChange={e => setCauseFocus(e.target.value)}
            placeholder="e.g. beach cleanup, river restoration"
            style={{ width: '100%' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={saving}>
          {saving ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  )
}
