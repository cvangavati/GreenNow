import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

const TABLE_MAP = {
  event: 'events',
  post: 'posts',
  campaign: 'campaigns'
}

export default function Moderation() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)
  const [flags, setFlags] = useState([])
  const [contentPreviews, setContentPreviews] = useState({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (user) checkAdminAndLoad()
  }, [user])

  async function checkAdminAndLoad() {
    setLoading(true)

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const admin = profile?.role === 'admin'
    setIsAdmin(admin)

    if (admin) {
      await loadFlags()
    }
    setLoading(false)
  }

  async function loadFlags() {
    const { data: flagData, error } = await supabase
      .from('flags')
      .select('*, profiles(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch error:', error)
      return
    }
    setFlags(flagData || [])

    // Load a preview of the actual flagged content, grouped by type
    const previews = {}
    for (const flag of flagData || []) {
      const table = TABLE_MAP[flag.content_type]
      if (!table) continue
      const { data } = await supabase
        .from(table)
        .select('*')
        .eq('id', flag.content_id)
        .maybeSingle()
      previews[flag.id] = data
    }
    setContentPreviews(previews)
  }

  async function dismissFlag(flagId) {
    setActionLoading(flagId)
    await supabase.from('flags').update({ status: 'dismissed' }).eq('id', flagId)
    await loadFlags()
    setActionLoading(null)
  }

  async function removeContent(flag) {
    setActionLoading(flag.id)
    const table = TABLE_MAP[flag.content_type]
    if (table) {
      await supabase.from(table).delete().eq('id', flag.content_id)
    }
    await supabase.from('flags').update({ status: 'reviewed' }).eq('id', flag.id)
    await loadFlags()
    setActionLoading(null)
  }

  async function banUser(userId, flagId) {
    setActionLoading(flagId)
    await supabase.from('profiles').update({ banned: true }).eq('id', userId)
    await supabase.from('flags').update({ status: 'reviewed' }).eq('id', flagId)
    await loadFlags()
    setActionLoading(null)
  }

  if (loading) return <p className="page-shell">Loading moderation queue...</p>

  if (!isAdmin) {
    return (
      <div className="page-shell">
        <div className="page-card">
          <h2>Moderation Queue</h2>
          <p className="form-help-text">This area is restricted to admins.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <h1>Moderation Queue</h1>
      <p className="form-help-text">{flags.length} pending report{flags.length !== 1 ? 's' : ''}</p>

      {flags.length === 0 && (
        <div className="empty-state">
          <h3>All clear</h3>
          <p>No pending reports to review.</p>
        </div>
      )}

      {flags.map(flag => {
        const content = contentPreviews[flag.id]
        return (
          <div key={flag.id} className="page-card" style={{ marginBottom: '1rem' }}>
            <span className="badge">{flag.content_type}</span>
            <p style={{ marginTop: '0.6rem' }}>
              <strong>Reason:</strong> {flag.reason}
            </p>
            <p className="form-help-text">
              Reported by {flag.profiles?.name || 'someone'} on {new Date(flag.created_at).toLocaleString()}
            </p>

            <div style={{
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.8rem',
              margin: '0.7rem 0',
              background: 'color-mix(in srgb, var(--surface-2) 50%, transparent)'
            }}>
              {content ? (
                <>
                  <strong>{content.title || content.content?.slice(0, 80) || '(content preview unavailable)'}</strong>
                  {content.description && <p className="form-help-text">{content.description}</p>}
                </>
              ) : (
                <p className="form-help-text">Content may have already been removed.</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="site-nav__button"
                disabled={actionLoading === flag.id}
                onClick={() => dismissFlag(flag.id)}
              >
                Dismiss
              </button>
              <button
                className="site-nav__button"
                disabled={actionLoading === flag.id}
                onClick={() => removeContent(flag)}
              >
                Remove Content
              </button>
              {content?.created_by || content?.author_id ? (
                <button
                  className="site-nav__button"
                  disabled={actionLoading === flag.id}
                  onClick={() => banUser(content.created_by || content.author_id, flag.id)}
                >
                  Ban User
                </button>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}