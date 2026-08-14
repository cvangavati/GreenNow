import { Link } from 'react-router-dom'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>GreenNow</strong>
        <p>Community cleanup, shared progress, and advocacy action.</p>
      </div>
      <nav aria-label="Footer navigation" className="site-footer__links">
        <Link to="/welcome">How it works</Link>
        <Link to="/impact">Community impact</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/privacy">Privacy</Link>
      </nav>
    </footer>
  )
}
