import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export default function Leaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  async function fetchLeaderboard() {
    setLoading(true)

    const { data: optedInProfiles } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('leaderboard_opt_in', true)

    if (!optedInProfiles || optedInProfiles.length === 0) {
      setRows([])
      setLoading(false)
      return
    }

    const optedInIds = optedInProfiles.map(p => p.id)

    const { data: rsvps } = await supabase
      .from('rsvps')
      .select('user_id, events(trash_collected_lbs)')
      .in('user_id', optedInIds)

    const scoreMap = {}
    optedInProfiles.forEach(p => {
      scoreMap[p.id] = { name: p.name, eventsAttended: 0, trashLbs: 0 }
    })

    ;(rsvps || []).forEach(r => {
      if (scoreMap[r.user_id]) {
        scoreMap[r.user_id].eventsAttended += 1
        scoreMap[r.user_id].trashLbs += parseFloat(r.events?.trash_collected_lbs) || 0
      }
    })

    const sorted = Object.values(scoreMap).sort((a, b) => b.eventsAttended - a.eventsAttended)
    setRows(sorted)
    setLoading(false)
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto' }}>
      <h1>Leaderboard</h1>
      <p style={{ color: '#888', fontSize: '0.85rem' }}>
        Only shows volunteers who opted in from their profile settings.
      </p>

      {loading && <p>Loading leaderboard...</p>}
      {!loading && rows.length === 0 && <p>No one has opted into the leaderboard yet.</p>}

      {rows.map((r, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          border: '1px solid #ccc',
          borderRadius: 8,
          marginBottom: 8
        }}>
          <span style={{ fontWeight: 600 }}>
            #{i + 1} {r.name || 'Anonymous Volunteer'}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#555' }}>
            {r.eventsAttended} events &nbsp;·&nbsp; {r.trashLbs} lbs
          </span>
        </div>
      ))}
    </div>
  )
}