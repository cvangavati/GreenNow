import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="page-shell">
      <section className="hero-panel">
        <div className="hero-panel__copy">
          <span className="hero-panel__eyebrow">🌱 GreenNow</span>
          <h1>Clean up the places you care about — together.</h1>
          <p className="hero-panel__lead">
            GreenNow connects people already fighting pollution with people who want to help. Report a
            polluted site in seconds, adopt one and schedule a real cleanup, or join an event someone else
            started — then help push for the policy changes that stop the problem at the source.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="action-link action-link--primary">Join GreenNow</Link>
            <Link to="/login" className="action-link action-link--secondary">Sign in</Link>
          </div>
        </div>
        <div className="hero-panel__aside">
          <div className="hero-panel__stat">
            <strong>Report</strong>
            <span>Flag a polluted site with a photo and a pin on the map — no commitment required.</span>
          </div>
          <div className="hero-panel__stat">
            <strong>Organize</strong>
            <span>Adopt a report or post your own cleanup with a date, and invite volunteers to join.</span>
          </div>
          <div className="hero-panel__stat">
            <strong>Advocate</strong>
            <span>Sign and share campaigns pushing for real policy change on dumping and waste.</span>
          </div>
        </div>
      </section>

      <section className="page-card" style={{ marginTop: '1.5rem' }}>
        <h2>Our mission</h2>
        <p style={{ lineHeight: 1.7, color: 'var(--text-muted)' }}>
          Our objective is to clean up polluted sites everywhere; from local beaches and rivers to
          neighborhood streets, starting in the United States and expanding to communities worldwide.
          Rather than relying on one large volunteer effort, GreenNow connects people already making change
          with people who want to get involved. As our community grows, we aim to build enough collective 
          voice to push governments and corporations toward real reform in dumping regulations and corporate 
          waste practices because the most effective cleanup is the one that never has to happen twice.
        </p>
      </section>

      <section className="page-card" style={{ marginTop: '1.5rem' }}>
        <h2>How it works</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem' }}>1. Report or post</h3>
            <p className="form-help-text">See something? Report it in seconds. Ready to organize? Post a full cleanup event.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem' }}>2. Adopt and schedule</h3>
            <p className="form-help-text">Anyone can adopt an unclaimed report and turn it into a real, scheduled cleanup.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem' }}>3. Show up and update</h3>
            <p className="form-help-text">RSVP, show up, and post progress — every event has a transparent, shared history.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem' }}>4. Push for change</h3>
            <p className="form-help-text">Sign and share advocacy campaigns aimed at the policies behind the pollution.</p>
          </div>
        </div>
      </section>

      <section className="page-card" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <h2>Ready to get started?</h2>
        <p className="form-help-text" style={{ marginBottom: '1rem' }}>
          It takes less than a minute to create an account and see what's happening near you.
        </p>
        <Link to="/signup" className="action-link action-link--primary">Create your account</Link>
      </section>
    </div>
  )
}