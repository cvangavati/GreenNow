import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="public-page public-page--narrow" aria-labelledby="not-found-title">
      <p className="public-page__eyebrow">404</p>
      <h1 id="not-found-title">We could not find that page.</h1>
      <p className="public-page__lead">
        The link may be outdated, or the page may have moved. You can return to GreenNow’s welcome page or continue to the cleanup bulletin.
      </p>
      <div className="hero-actions">
        <Link className="action-link action-link--primary" to="/welcome">Go to welcome</Link>
        <Link className="action-link action-link--secondary" to="/">Open bulletin</Link>
      </div>
    </section>
  )
}
