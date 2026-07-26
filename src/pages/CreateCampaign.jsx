import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function CreateCampaign() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [isEligible, setIsEligible] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [policyAsk, setPolicyAsk] = useState('')
  const [target, setTarget] = useState('')
  const [region, setRegion] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function checkRole() {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setIsEligible(data?.role === 'org' || data?.role === 'admin')
    }
    if (user) checkRole()
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !policyAsk.trim()) {
      setError('Please fill in a title and policy ask.')
      return
    }
    setSaving(true)
    setError(null)

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        title: title.trim(),
        description: description.trim(),
        policy_ask: policyAsk.trim(),
        target: target.trim(),
        region: region.trim(),
        created_by: user.id
      })
      .select()
      .single()

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate(`/campaigns/${data.id}`)
  }

  if (isEligible === null) return <p style={{ padding: 40 }}>Checking eligibility...</p>

  if (!isEligible) {
    return (
      <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 16px' }}>
        <h2>Create a Campaign</h2>
        <p style={{ color: '#888' }}>
          Campaign creation is currently limited to verified organizations and admins, to keep advocacy asks
          credible and coordinated. If you represent an organization and want to launch a campaign, reach out
          to the CleanBeach team to get your account verified.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 16px' }}>
      <h2>Create a Campaign</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Campaign title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%' }} />
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
          <label>Policy ask (what specific change are you requesting?)</label>
          <textarea
            value={policyAsk}
            onChange={e => setPolicyAsk(e.target.value)}
            rows={3}
            placeholder="e.g. Ban single-use plastic bags in city limits"
            required
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label>Target (who is this aimed at?)</label>
          <input
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="e.g. City Council, EPA, a specific company"
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label>Region</label>
          <input
            value={region}
            onChange={e => setRegion(e.target.value)}
            placeholder="e.g. San Francisco, CA"
            style={{ width: '100%' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={saving}>
          {saving ? 'Creating...' : 'Create Campaign'}
        </button>
      </form>
    </div>
  )
}