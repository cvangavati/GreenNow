import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function Groups() {
  const [groups, setGroups] = useState([])
  const [memberCounts, setMemberCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroups()
  }, [])

  async function fetchGroups() {
    setLoading(true)
    const { data: groupsData, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch error:', error)
      setLoading(false)
      return
    }
    setGroups(groupsData)

    const { data: memberData } = await supabase
      .from('group_members')
      .select('group_id')

    const counts = {}
    memberData?.forEach(m => {
      counts[m.group_id] = (counts[m.group_id] || 0) + 1
    })
    setMemberCounts(counts)

    setLoading(false)
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: 700, margin: '0 auto' }}>
      <h1>Community groups</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Join a local group to coordinate efforts, share updates, and stay connected with neighbors.
      </p>
      <p><Link to="/create-group">Create a group</Link></p>

      {loading && <p role="status">Loading groups…</p>}
      {!loading && groups.length === 0 && <p>No groups have been created yet. Start the first one for your area.</p>}

      {groups.map(g => (
        <div key={g.id} style={{ border: '1px solid #ccc', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <h3 style={{ margin: '4px 0' }}>
            <Link to={`/groups/${g.id}`}>{g.name}</Link>
          </h3>
          <p style={{ margin: '4px 0', color: '#555' }}>{g.description}</p>
          <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
            {g.region && <>📍 {g.region} &nbsp;·&nbsp;</>}
            {g.cause_focus && <>🌱 {g.cause_focus} &nbsp;·&nbsp;</>}
            👥 {memberCounts[g.id] || 0} member{(memberCounts[g.id] || 0) !== 1 ? 's' : ''}
          </p>
        </div>
      ))}
    </div>
  )
}