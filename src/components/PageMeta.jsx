import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const DEFAULT_DESCRIPTION = 'GreenNow is a community platform for reporting pollution, organizing cleanups, sharing progress, and supporting advocacy campaigns.'

const ROUTE_METADATA = [
  { match: path => path === '/', title: 'Cleanup Bulletin', description: 'Discover local cleanup activity and ways to get involved with GreenNow.' },
  { match: path => path === '/welcome', title: 'Community Cleanup and Advocacy', description: 'Report pollution, organize local cleanups, and support environmental advocacy with GreenNow.' },
  { match: path => path === '/signup', title: 'Create an Account', description: 'Create a GreenNow account to report pollution, organize cleanups, and connect with local volunteers.' },
  { match: path => path === '/login', title: 'Sign In', description: 'Sign in to GreenNow to coordinate cleanups, share progress, and join local environmental action.' },
  { match: path => path === '/forgot-password', title: 'Reset Password', description: 'Request a secure GreenNow password reset link.' },
  { match: path => path === '/reset-password', title: 'Set a New Password', description: 'Set a new password for your GreenNow account.' },
  { match: path => path === '/faq', title: 'Frequently Asked Questions', description: 'Learn how GreenNow reports sites, organizes cleanups, shares progress, and supports advocacy.' },
  { match: path => path === '/feedback', title: 'How Can We Improve?', description: 'Share feedback, accessibility suggestions, feature ideas, or safety concerns to help improve GreenNow.' },
  { match: path => path === '/privacy', title: 'Privacy Policy', description: 'Read the GreenNow privacy policy and how account, location, event, and media information is handled.' },
  { match: path => path === '/impact', title: 'Community Impact', description: 'Explore verified cleanup results and before-and-after progress shared by the GreenNow community.' },
  { match: path => path === '/thank-you', title: 'Thank You', description: 'Thank you for taking action with GreenNow.' },
  { match: path => path === '/feed', title: 'Community Feed', description: 'Share updates and follow environmental action in the GreenNow community.' },
  { match: path => path === '/groups', title: 'Community Groups', description: 'Find or create GreenNow groups organized around local areas and environmental causes.' },
  { match: path => path === '/map', title: 'Cleanup Map', description: 'View GreenNow cleanup reports and events on an interactive map.' },
  { match: path => path === '/gallery', title: 'Impact Gallery', description: 'View completed GreenNow cleanups with community-shared before-and-after photos.' },
  { match: path => path === '/campaigns', title: 'Advocacy Campaigns', description: 'Support GreenNow campaigns focused on policy changes that address pollution at its source.' },
  { match: path => path === '/leaderboard', title: 'Community Leaderboard', description: 'See opt-in GreenNow community impact and cleanup participation.' },
  { match: path => path === '/profile', title: 'Your Profile', description: 'Manage your GreenNow profile, community interests, and activity.' },
  { match: path => path === '/report-site', title: 'Report a Polluted Site', description: 'Report a local polluted site so the GreenNow community can organize a response.' },
  { match: path => path === '/new-event', title: 'Post a Cleanup', description: 'Create a GreenNow cleanup event and invite volunteers to participate.' },
  { match: path => path === '/create-group', title: 'Create a Community Group', description: 'Create a GreenNow group for your neighborhood, region, or environmental cause.' },
  { match: path => path === '/create-campaign', title: 'Create an Advocacy Campaign', description: 'Create a GreenNow campaign for environmental policy change.' },
  { match: path => path === '/get-verified', title: 'Organization Verification', description: 'Request verification for an organization on GreenNow.' },
  { match: path => path === '/find-reps', title: 'Find Representatives', description: 'Find U.S. representatives by state for GreenNow advocacy campaigns.' },
  { match: path => path === '/moderation', title: 'Moderation Queue', description: 'Review flagged content in the GreenNow moderation workspace.' },
  { match: path => path === '/analytics', title: 'Community Analytics', description: 'Review GreenNow community activity and cleanup-impact statistics.' }
]

function setMeta(selector, attributes, content) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export default function PageMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const match = ROUTE_METADATA.find(entry => entry.match(pathname))
    const title = match?.title || (pathname.startsWith('/events/') ? 'Cleanup Details' : pathname.startsWith('/groups/') ? 'Community Group' : pathname.startsWith('/campaigns/') ? 'Advocacy Campaign' : 'Page Not Found')
    const description = match?.description || DEFAULT_DESCRIPTION
    const fullTitle = `${title} | GreenNow`
    const canonicalUrl = `${window.location.origin}${pathname}`

    document.title = fullTitle
    setMeta('meta[name="description"]', { name: 'description' }, description)
    setMeta('meta[property="og:title"]', { property: 'og:title' }, fullTitle)
    setMeta('meta[property="og:description"]', { property: 'og:description' }, description)
    setMeta('meta[property="og:type"]', { property: 'og:type' }, 'website')
    setMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl)
    setMeta('meta[property="og:image"]', { property: 'og:image' }, `${window.location.origin}/social-share.png`)
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image')
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, fullTitle)
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description)
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, `${window.location.origin}/social-share.png`)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)
  }, [pathname])

  return null
}
