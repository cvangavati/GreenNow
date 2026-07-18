import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function GroupDetail() {
  const { id } = useParams()
  const { user } = useAuth()

  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [groupEvents, setGroupEvents] = useState([])
  const [groupPosts, setGroupPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [joinLoading, setJoinLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setLoading(true)

    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single()

    if (groupError) {
      setError('Could not load this group.')
      setLoading(false)
      return
    }

    const { data: memberData } = await supabase
      .from('group_members')
      .select('*, profiles(name)')
      .eq('group_id', id)

    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .eq('group_id', id)
      .order('date_time', { ascending: true })

    const { data: postsData } = await supabase
      .from('posts')
      .select('*, profiles(name)')
      .eq('group_id', id)
      .order('created_at', { ascending: false })

    setGroup(groupData)
    setMembers(memberData || [])
    setGroupEvents(eventsData || [])
    setGroupPosts(postsData || [])
    setLoading(false)
  }

  const isMember = members.some(m => m.user_id === user?.id)

  async function toggleMembership() {
    setJoinLoading(true)

    if (isMember) {
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', id)
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('group_members')
        .insert({ group_id: id, user_id: user.id })
    }

    await fetchData()
    setJoinLoading(false)
  }

  if (loading) return <p style={{ padding: 40 }}>Loading group...</p>
  if (error && !group) return <p style={{ padding: 40, color: 'red' }}>{error}</p>
  if (!group) return null

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
      <p><Link to="/groups">&larr; Back to Groups</Link></p>

      <h1>{group.name}</h1>
      <p style={{ color: '#555' }}>{group.description}</p>
      <p style={{ fontSize: '0.9rem' }}>
        {group.region && <>📍 {group.region} &nbsp;·&nbsp;</>}
        {group.cause_focus && <>🌱 {group.cause_focus}</>}
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '16px 0',
        padding: '12px 16px',
        background: '#f0f4f2',
        borderRadius: 8
      }}>
        <span style={{ fontWeight: 600 }}>
          👥 {members.length} member{members.length !== 1 ? 's' : ''}
        </span>
        <button onClick={toggleMembership} disabled={joinLoading}>
          {joinLoading ? 'Updating...' : isMember ? 'Leave Group' : 'Join Group'}
        </button>
      </div>

      <h3>Members</h3>
      <ul>
        {members.map(m => (
          <li key={m.id}>{m.profiles?.name || 'Someone'}</li>
        ))}
      </ul>

      <h3 style={{ marginTop: 24 }}>Group Bulletin</h3>
      {groupEvents.length === 0 && <p style={{ color: '#888' }}>No events posted to this group yet.</p>}
      {groupEvents.map(ev => (
        <div key={ev.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <Link to={`/events/${ev.id}`}>{ev.title}</Link>
          <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#555' }}>
            📍 {ev.address} &nbsp;·&nbsp; {ev.status}
          </p>
        </div>
      ))}

      <h3 style={{ marginTop: 24 }}>Group Feed</h3>
      {groupPosts.length === 0 && <p style={{ color: '#888' }}>No posts in this group yet.</p>}
      {groupPosts.map(p => (
        <div key={p.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <p style={{ fontSize: '0.75rem', color: '#888', margin: '0 0 4px' }}>
            {p.profiles?.name || 'Someone'} — {new Date(p.created_at).toLocaleString()}
          </p>
          <p style={{ margin: 0 }}>{p.content}</p>
        </div>
      ))}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}