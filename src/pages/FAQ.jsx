import { Link } from 'react-router-dom'

const QUESTIONS = [
  {
    question: 'How do I report a polluted site?',
    answer: 'After creating an account, use the report flow to add a location, choose a site type and urgency, describe the issue, and optionally attach a photo. Reports can later be adopted and scheduled as cleanups.'
  },
  {
    question: 'Can I organize a cleanup myself?',
    answer: 'Yes. You can post a cleanup site with a date and time, volunteer target, location, optional photo, and optional group connection. You can also claim an unclaimed report and schedule it.'
  },
  {
    question: 'How do I join a cleanup?',
    answer: 'Open a cleanup from the bulletin or map, review its details, and use the RSVP control to join. Event pages also show status updates and documented cleanup progress when organizers share them.'
  },
  {
    question: 'What are groups and campaigns for?',
    answer: 'Groups help people connect around a location or cause. Campaigns let members support policy-focused advocacy and share campaign links with their communities.'
  },
  {
    question: 'How is my information used in GreenNow?',
    answer: 'GreenNow uses account, profile, event, post, location, and optional photo information to provide the community features you choose to use. Read the privacy policy for further detail.'
  }
]

export default function FAQ() {
  return (
    <section className="public-page" aria-labelledby="faq-title">
      <p className="public-page__eyebrow">Helpful answers</p>
      <h1 id="faq-title">Frequently asked questions</h1>
      <p className="public-page__lead">These answers describe the features currently available in GreenNow.</p>
      <div className="faq-list">
        {QUESTIONS.map(({ question, answer }) => (
          <details key={question} className="faq-item">
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
      <div className="hero-actions">
        <Link className="action-link action-link--primary" to="/signup">Create an account</Link>
        <Link className="action-link action-link--secondary" to="/privacy">Read privacy policy</Link>
      </div>
    </section>
  )
}
