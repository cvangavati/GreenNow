import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { useRateLimit } from '../hooks/useRateLimit'

export default function CreateGroup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { attempt } = useRateLimit(3000)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [region, setRegion] = useState('')
  const [causeFocus, setCauseFocus] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please add a group name before continuing.')
      return
    }

    if (!attempt()) {
      setError('Please wait a few seconds before trying again.')
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
    <div className="auth-shell">
      <div className="auth-card">
        <h2>Start a neighborhood group</h2>
        <p className="form-help-text">
          Create a group to organize local action around a shared cause and keep people connected.
        </p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="group-name">Group name</label>
            <input
              id="group-name"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'group-error' : undefined}
            />
          </div>
          <div className="form-field">
            <label htmlFor="group-description">What is this group for?</label>
            <textarea
              id="group-description"
              name="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-field">
            <label htmlFor="group-region">Area or region</label>
            <input
              id="group-region"
              name="region"
              value={region}
              onChange={e => setRegion(e.target.value)}
              placeholder="e.g. Bay Area, CA"
            />
          </div>
          <div className="form-field">
            <label htmlFor="group-cause">Cause focus</label>
            <input
              id="group-cause"
              name="causeFocus"
              value={causeFocus}
              onChange={e => setCauseFocus(e.target.value)}
              placeholder="e.g. beach cleanup, river restoration"
            />
          </div>
          {error && (
            <p id="group-error" className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="form-submit" type="submit" disabled={saving}>
            {saving ? 'Creating…' : 'Create group'}
          </button>
        </form>
      </div>
    </div>
  )
}