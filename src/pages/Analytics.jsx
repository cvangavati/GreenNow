import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function Analytics() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

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

    if (admin) await loadStats()
    setLoading(false)
  }

  async function loadStats() {
    const [
      usersCount,
      eventsCount,
      cleanedCount,
      postsCount,
      likesCount,
      commentsCount,
      campaignsCount,
      signaturesCount,
      groupsCount,
      flagsPendingCount,
      trashData
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'cleaned'),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('post_likes').select('*', { count: 'exact', head: true }),
      supabase.from('post_comments').select('*', { count: 'exact', head: true }),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }),
      supabase.from('campaign_signatures').select('*', { count: 'exact', head: true }),
      supabase.from('groups').select('*', { count: 'exact', head: true }),
      supabase.from('flags').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('events').select('trash_collected_lbs').eq('status', 'cleaned')
    ])

    const totalTrashLbs = (trashData.data || []).reduce(
      (sum, ev) => sum + (parseFloat(ev.trash_collected_lbs) || 0), 0
    )

    const totalEvents = eventsCount.count || 0
    const cleaned = cleanedCount.count || 0
    const completionRate = totalEvents > 0 ? Math.round((cleaned / totalEvents) * 100) : 0

    const [eventCreators, postAuthors, signers] = await Promise.all([
      supabase.from('events').select('created_by'),
      supabase.from('posts').select('author_id'),
      supabase.from('campaign_signatures').select('user_id')
    ])

    const activeUserIds = new Set([
      ...(eventCreators.data || []).map(e => e.created_by),
      ...(postAuthors.data || []).map(p => p.author_id),
      ...(signers.data || []).map(s => s.user_id)
    ].filter(Boolean))

    setStats({
      totalUsers: usersCount.count || 0,
      activeUsers: activeUserIds.size,
      totalEvents,
      cleanedEvents: cleaned,
      completionRate,
      totalTrashLbs,
      totalPosts: postsCount.count || 0,
      totalLikes: likesCount.count || 0,
      totalComments: commentsCount.count || 0,
      totalCampaigns: campaignsCount.count || 0,
      totalSignatures: signaturesCount.count || 0,
      totalGroups: groupsCount.count || 0,
      pendingFlags: flagsPendingCount.count || 0
    })
  }

  if (loading) return <p className="page-shell">Loading analytics…</p>

  if (!isAdmin) {
    return (
      <div className="page-shell">
        <div className="page-card">
          <h2>Analytics</h2>
          <p className="form-help-text">This area is restricted to admins.</p>
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Total users', value: stats.totalUsers },
    { label: 'Active users', value: stats.activeUsers, note: 'created an event, post, or signed a campaign' },
    { label: 'Total cleanups', value: stats.totalEvents },
    { label: 'Cleanups completed', value: stats.cleanedEvents },
    { label: 'Completion rate', value: `${stats.completionRate}%` },
    { label: 'Lbs trash removed', value: stats.totalTrashLbs },
    { label: 'Feed posts', value: stats.totalPosts },
    { label: 'Post likes', value: stats.totalLikes },
    { label: 'Post comments', value: stats.totalComments },
    { label: 'Groups', value: stats.totalGroups },
    { label: 'Campaigns', value: stats.totalCampaigns },
    { label: 'Campaign signatures', value: stats.totalSignatures },
    { label: 'Pending reports', value: stats.pendingFlags }
  ]

  return (
    <div className="page-shell">
      <h1>Analytics</h1>
      <p className="form-help-text">
        Snapshot pulled live from the database. "Active users" is a rough proxy based on who has created
        content, not real session/page-view tracking.
      </p>

      <div className="hero-panel__aside" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.9rem',
        marginTop: '1.25rem'
      }}>
        {cards.map(c => (
          <div key={c.label} className="hero-panel__stat">
            <strong>{c.value}</strong>
            <span>{c.label}</span>
            {c.note && (
              <div className="form-help-text" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                {c.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}