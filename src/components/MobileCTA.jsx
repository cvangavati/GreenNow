import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const HIDDEN_PATHS = new Set(['/signup', '/login', '/forgot-password', '/reset-password', '/thank-you'])

export default function MobileCTA() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  if (HIDDEN_PATHS.has(pathname)) return null

  const to = user ? '/report-site' : '/signup'
  const label = user ? 'Report a site' : 'Join GreenNow'

  return (
    <Link className="mobile-cta" to={to}>
      {label}
    </Link>
  )
}
