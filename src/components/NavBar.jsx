import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      padding: '12px 24px',
      background: '#0f3d2e',
      color: 'white'
    }}>
      <Link to="/" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}>
        🌊 CleanBeach
      </Link>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/" style={{ color: 'white' }}>Bulletin</Link>
            <Link to="/profile" style={{ color: 'white' }}>Profile</Link>
            <button onClick={handleSignOut} style={{ cursor: 'pointer' }}>Log Out</button>
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