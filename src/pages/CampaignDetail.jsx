import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function CampaignDetail() {
  const { id } = useParams()
  const { user } = useAuth()

  const [campaign, setCampaign] = useState(null)
  const [signatures, setSignatures] = useState([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setLoading(true)

    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (campaignError) {
      setError('Could not load this campaign.')
      setLoading(false)
      return
    }

    const { data: sigData } = await supabase
      .from('campaign_signatures')
      .select('*, profiles(name)')
      .eq('campaign_id', id)
      .order('created_at', { ascending: false })

    setCampaign(campaignData)
    setSignatures(sigData || [])
    setLoading(false)

    // Update page title and OG meta tags for link previews when shared
    if (campaignData) {
      document.title = `${campaignData.title} — CleanBeach Campaign`
      setMetaTag('property', 'og:title', campaignData.title)
      setMetaTag('property', 'og:description', campaignData.description || campaignData.policy_ask || 'Sign this environmental campaign on CleanBeach.')
      setMetaTag('property', 'og:url', window.location.href)
      setMetaTag('property', 'og:type', 'website')
      setMetaTag('name', 'twitter:card', 'summary')
      setMetaTag('name', 'twitter:title', campaignData.title)
      setMetaTag('name', 'twitter:description', campaignData.description || campaignData.policy_ask || '')
    }
  }

  function setMetaTag(attr, key, content) {
    let tag = document.querySelector(`meta[${attr}="${key}"]`)
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute(attr, key)
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', content)
  }

  const hasSigned = signatures.some(s => s.user_id === user?.id)

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSign(e) {
    e.preventDefault()
    if (hasSigned) return
    setSigning(true)
    setError(null)

    const { error } = await supabase
      .from('campaign_signatures')
      .insert({ campaign_id: id, user_id: user.id, comment: comment.trim() || null })

    setSigning(false)

    if (error) {
      setError(error.message)
      return
    }

    setComment('')
    await fetchData()
  }

  if (loading) return <p style={{ padding: 40 }}>Loading campaign...</p>
  if (error && !campaign) return <p style={{ padding: 40, color: 'red' }}>{error}</p>
  if (!campaign) return null

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
      <p><Link to="/campaigns">&larr; Back to Campaigns</Link></p>

      <h1>{campaign.title}</h1>
      <p style={{ color: '#555' }}>{campaign.description}</p>

      <div style={{ background: '#f0f8f4', borderRadius: 8, padding: 14, margin: '16px 0' }}>
        <p style={{ margin: '0 0 6px', fontWeight: 600 }}>📋 The Ask</p>
        <p style={{ margin: 0 }}>{campaign.policy_ask}</p>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#555' }}>
        {campaign.target && <>🎯 Target: {campaign.target} &nbsp;·&nbsp;</>}
        {campaign.region && <>📍 {campaign.region}</>}
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '20px 0',
        padding: '14px 16px',
        background: '#fff3e0',
        borderRadius: 8
      }}>
        <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#d98c2b' }}>
          ✍️ {signatures.length} signature{signatures.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={handleCopyLink}>
          {copied ? '✓ Link Copied!' : '🔗 Copy Link'}
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(campaign.title)}&url=${encodeURIComponent(window.location.href)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button type="button">🐦 Share on X</button>
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button type="button">📘 Share on Facebook</button>
        </a>
      </div>

      {!hasSigned ? (
        <form onSubmit={handleSign} style={{ marginBottom: 20 }}>
          <label style={{ fontSize: '0.85rem' }}>Why does this matter to you? (optional)</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <button type="submit" disabled={signing}>
            {signing ? 'Signing...' : 'Sign This Petition'}
          </button>
        </form>
      ) : (
        <p style={{ color: '#2d9166', fontWeight: 600 }}>✓ You've signed this petition. Thank you!</p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>Signatures &amp; Comments</h3>
      {signatures.filter(s => s.comment).length === 0 && (
        <p style={{ color: '#888' }}>No comments yet.</p>
      )}
      {signatures.filter(s => s.comment).map(s => (
        <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '0.85rem' }}>
          <strong>{s.profiles?.name || 'Someone'}</strong>: {s.comment}
        </div>
      ))}
    </div>
  )
}