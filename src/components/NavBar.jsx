import { Link, useNavigate } from 'react-router-dom'
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
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
      padding: '12px 24px',
      background: '#0f3d2e',
      color: 'white'
    }}>
      <Link to="/" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}>
        🌊 CleanBeach
      </Link>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {user ? (
          <>
            <Link to="/" style={{ color: 'white' }}>Bulletin</Link>
            <Link to="/feed" style={{ color: 'white' }}>Feed</Link>
            <Link to="/groups" style={{ color: 'white' }}>Groups</Link>
            <Link to="/map" style={{ color: 'white' }}>Map</Link>
            <Link to="/gallery" style={{ color: 'white' }}>Gallery</Link>
            <Link to="/profile" style={{ color: 'white' }}>Profile</Link>
            <Link to="/leaderboard" style={{ color: 'white' }}>Leaderboard</Link>
            <NotificationBell />
            <button onClick={handleSignOut} style={{ cursor: 'pointer', padding: '8px 14px' }}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white' }}>Log In</Link>
            <Link to="/signup" style={{ color: 'white' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}