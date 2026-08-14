import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function Impact() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadImpact() {
      const { data, error: loadError } = await supabase
        .from('events')
        .select('id,title,address,photos,after_photo_url,trash_collected_lbs,date_time')
        .eq('status', 'cleaned')
        .not('after_photo_url', 'is', null)
        .order('date_time', { ascending: false })
        .limit(12)

      if (loadError) {
        setError('Community impact records are not available right now.')
      } else {
        setEvents(data || [])
      }
      setLoading(false)
    }

    loadImpact()
  }, [])

  return (
    <section className="public-page" aria-labelledby="impact-title">
      <p className="public-page__eyebrow">Community progress</p>
      <h1 id="impact-title">Cleanup impact, shared by the community</h1>
      <p className="public-page__lead">
        This page uses completed-cleanup records and photos shared through GreenNow. It does not contain curated or seeded testimonials.
      </p>

      {loading && <p className="public-page__status">Loading recent cleanup updates…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <div className="empty-state">
          <h2>No completed cleanup stories are available yet.</h2>
          <p>When organizers share completed cleanup updates with after photos, they can appear here.</p>
        </div>
      )}

      {events.length > 0 && (
        <div className="impact-grid">
          {events.map(event => (
            <article key={event.id} className="impact-card">
              {event.after_photo_url && (
                <img
                  src={event.after_photo_url}
                  alt={`After cleanup: ${event.title}`}
                  loading="lazy"
                />
              )}
              <div className="impact-card__body">
                <h2>{event.title}</h2>
                <p>{event.address || 'Location shared with the cleanup event.'}</p>
                {event.trash_collected_lbs != null && (
                  <p className="impact-card__metric">{event.trash_collected_lbs} lbs recorded as collected</p>
                )}
                <Link to={`/events/${event.id}`}>View cleanup details</Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="hero-actions">
        <Link className="action-link action-link--primary" to="/signup">Join GreenNow</Link>
        <Link className="action-link action-link--secondary" to="/welcome">How GreenNow works</Link>
      </div>
    </section>
  )
}
