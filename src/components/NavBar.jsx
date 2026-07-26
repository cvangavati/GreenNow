import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

export default function NavBar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="site-nav">
      <Link to="/" className="site-nav__brand">
        <span className="site-nav__brand-mark">✦</span>
        <span>GreenNow</span>
      </Link>
      <div className="site-nav__links">
        {user ? (
          <>
            <NavLink to="/" className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}>
              Bulletin
            </NavLink>
            <NavLink to="/feed" className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}>
              Feed
            </NavLink>
            <NavLink to="/groups" className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}>
              Groups
            </NavLink>
            <NavLink to="/campaigns" className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}>
              Campaigns
            </NavLink>
            <NavLink to="/map" className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}>
              Map
            </NavLink>
            <NavLink to="/gallery" className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}>
              Gallery
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}>
              Profile
            </NavLink>
            <NavLink to="/leaderboard" className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}>
              Leaderboard
            </NavLink>
            <NotificationBell />
            <button className="site-nav__button" onClick={handleSignOut}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}>
              Log In
            </NavLink>
            <NavLink to="/signup" className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}>
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </nav>
  )
}