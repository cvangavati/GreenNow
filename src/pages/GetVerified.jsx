import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function GetVerified() {
  const { user } = useAuth()
  const [orgName, setOrgName] = useState('')
  const [website, setWebsite] = useState('')
  const [justification, setJustification] = useState('')
  const [existingRequest, setExistingRequest] = useState(null)
  const [currentRole, setCurrentRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) loadStatus()
  }, [user])

  async function loadStatus() {
    setLoading(true)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    setCurrentRole(profileData?.role || 'user')

    const { data: requestData } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setExistingRequest(requestData)
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!orgName.trim() || !justification.trim()) {
      setError('Please fill in your organization name and a short justification.')
      return
    }
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from('verification_requests')
      .insert({
        user_id: user.id,
        org_name: orgName.trim(),
        website: website.trim(),
        justification: justification.trim()
      })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    await loadStatus()
  }

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>

  if (currentRole === 'org' || currentRole === 'admin') {
    return (
      <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 16px' }}>
        <h2>Get Verified</h2>
        <p style={{ color: '#2d9166', fontWeight: 600 }}>
          ✓ Your account is already verified as {currentRole === 'admin' ? 'an admin' : 'an organization'}.
        </p>
      </div>
    )
  }

  if (existingRequest && existingRequest.status === 'pending') {
    return (
      <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 16px' }}>
        <h2>Get Verified</h2>
        <p>
          Your request for <strong>{existingRequest.org_name}</strong> is pending review.
          We'll update your account once it's approved.
        </p>
      </div>
    )
  }

  if (existingRequest && existingRequest.status === 'rejected') {
    return (
      <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 16px' }}>
        <h2>Get Verified</h2>
        <p style={{ color: '#c14848' }}>
          Your previous request for <strong>{existingRequest.org_name}</strong> was not approved.
          You can submit a new request below with more detail.
        </p>
        {renderForm()}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 16px' }}>
      <h2>Get Verified</h2>
      <p style={{ color: '#888', fontSize: '0.85rem' }}>
        Verified organization accounts get a badge on their posts and events, and can create advocacy campaigns.
        Submit a quick request below — our team reviews these manually.
      </p>
      {renderForm()}
    </div>
  )

  function renderForm() {
    return (
      <form onSubmit={handleSubmit}>
        <div>
          <label>Organization name</label>
          <input value={orgName} onChange={e => setOrgName(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div>
          <label>Website (optional)</label>
          <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." style={{ width: '100%' }} />
        </div>
        <div>
          <label>Tell us about your organization</label>
          <textarea
            value={justification}
            onChange={e => setJustification(e.target.value)}
            rows={4}
            placeholder="What does your org do, and how does it relate to environmental cleanup?"
            required
            style={{ width: '100%' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={saving}>
          {saving ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    )
  }
}