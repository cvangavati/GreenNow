import { Link } from 'react-router-dom'

export default function Leaderboard() {
  return (
    <section className="public-page public-page--narrow" aria-labelledby="leaderboard-title">
      <p className="public-page__eyebrow">Community recognition</p>
      <h1 id="leaderboard-title">Community leaderboard</h1>
      <div className="empty-state">
        <h2>Leaderboard updates are being prepared</h2>
        <p>
          GreenNow is not currently displaying individual impact totals on a public leaderboard. This feature will return only after privacy-preserving participation settings are fully configured.
        </p>
      </div>
      <div className="hero-actions">
        <Link className="action-link action-link--primary" to="/impact">View community impact</Link>
        <Link className="action-link action-link--secondary" to="/welcome">Learn how GreenNow works</Link>
      </div>
    </section>
  )
}
