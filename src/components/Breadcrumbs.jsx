import { Link, useLocation } from 'react-router-dom'

const LABELS = {
  welcome: 'Welcome',
  signup: 'Create account',
  login: 'Sign in',
  'forgot-password': 'Reset password',
  'reset-password': 'Set password',
  faq: 'FAQ',
  feedback: 'How can we improve?',
  privacy: 'Privacy',
  impact: 'Impact',
  'thank-you': 'Thank you',
  feed: 'Feed',
  groups: 'Groups',
  campaigns: 'Campaigns',
  map: 'Map',
  gallery: 'Gallery',
  profile: 'Profile',
  leaderboard: 'Leaderboard',
  'report-site': 'Report a site',
  'new-event': 'Post a cleanup',
  'create-group': 'Create a group',
  'create-campaign': 'Create a campaign',
  'get-verified': 'Get verified',
  'find-reps': 'Find representatives',
  moderation: 'Moderation',
  analytics: 'Analytics',
  'contact-rep': 'Contact representative'
}

function getLabel(segment, isCurrent) {
  if (LABELS[segment]) return LABELS[segment]
  return isCurrent ? 'Page not found' : 'Details'
}

export default function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0 || pathname === '/welcome') return null

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/welcome">Home</Link>
      {segments.map((segment, index) => {
        const to = `/${segments.slice(0, index + 1).join('/')}`
        const isCurrent = index === segments.length - 1
        return (
          <span key={`${segment}-${index}`} className="breadcrumbs__item">
            <span aria-hidden="true">/</span>
            {isCurrent ? <span aria-current="page">{getLabel(segment, true)}</span> : <Link to={to}>{getLabel(segment, false)}</Link>}
          </span>
        )
      })}
    </nav>
  )
}
