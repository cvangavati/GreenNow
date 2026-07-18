import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function GroupDetail() {
  const { id } = useParams()
  const { user } = useAuth()

  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
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

    setGroup(groupData)
    setMembers(memberData || [])
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

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}