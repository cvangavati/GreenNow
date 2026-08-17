import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

function formatImpact(value) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })
}

export default function Leaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  async function loadLeaderboard() {
    setLoading(true)
    setError(null)

    const { data, error: leaderboardError } = await supabase.rpc('get_leaderboard')

    if (leaderboardError) {
      const missingSetup = leaderboardError.code === 'PGRST202' || leaderboardError.message?.includes('get_leaderboard')
      setError(
        missingSetup
          ? 'The leaderboard setup has not been completed yet. Please ask an administrator to apply the Supabase leaderboard setup.'
          : 'We could not load the leaderboard right now. Please try again shortly.'
      )
      setRows([])
      setLoading(false)
      return
    }

    setRows(data || [])
    setLoading(false)
  }

  return (
    <section className="public-page public-page--narrow" aria-labelledby="leaderboard-title">
      <p className="public-page__eyebrow">Community recognition</p>
      <h1 id="leaderboard-title">Community leaderboard</h1>
      <p className="public-page__lead">
        Celebrate the cleanup work that members have chosen to share with the GreenNow community.
      </p>

      {loading && <div className="empty-state"><p>Loading community impact…</p></div>}

      {error && (
        <div className="state-banner state-banner--info" role="status">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="empty-state">
          <h2>No shared impact yet</h2>
          <p>Members can opt in from their Profile settings when they are ready to share their aggregate cleanup impact.</p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <ol className="leaderboard-list">
          {rows.map((row, index) => (
            <li key={row.profile_id} className="leaderboard-row">
              <span className="leaderboard-row__rank" aria-label={`Rank ${index + 1}`}>#{index + 1}</span>
              <div className="leaderboard-row__member">
                <strong>{row.display_name}</strong>
                <span>{formatImpact(row.events_attended)} cleanup{Number(row.events_attended) === 1 ? '' : 's'} joined</span>
              </div>
              <span className="leaderboard-row__impact">{formatImpact(row.trash_collected_lbs)} lbs</span>
            </li>
          ))}
        </ol>
      )}

      <div className="hero-actions">
        <Link className="action-link action-link--primary" to="/profile">Manage leaderboard visibility</Link>
        <Link className="action-link action-link--secondary" to="/impact">View community impact</Link>
      </div>
    </section>
  )
}
