import { Link, useSearchParams } from 'react-router-dom'

const MESSAGES = {
  account: {
    title: 'Thank you for joining GreenNow.',
    body: 'Your account request was received. If email confirmation is enabled for this project, check your inbox before signing in.'
  },
  campaign: {
    title: 'Thank you for supporting this campaign.',
    body: 'Your support has been recorded. You can continue exploring local cleanup activity or share the campaign with your community.'
  },
  default: {
    title: 'Thank you for taking action.',
    body: 'Every report, cleanup, and advocacy effort helps make local environmental action more visible.'
  }
}

export default function ThankYou() {
  const [searchParams] = useSearchParams()
  const message = MESSAGES[searchParams.get('kind')] || MESSAGES.default

  return (
    <section className="public-page public-page--narrow" aria-labelledby="thank-you-title">
      <p className="public-page__eyebrow">GreenNow</p>
      <h1 id="thank-you-title">{message.title}</h1>
      <p className="public-page__lead">{message.body}</p>
      <div className="hero-actions">
        <Link className="action-link action-link--primary" to="/">Continue to GreenNow</Link>
        <Link className="action-link action-link--secondary" to="/welcome">Learn how it works</Link>
      </div>
    </section>
  )
}
