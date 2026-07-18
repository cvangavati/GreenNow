import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (user) fetchNotifications()
    const interval = setInterval(() => {
      if (user) fetchNotifications()
    }, 30000)
    return () => clearInterval(interval)
  }, [user])

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    setNotifications(data || [])
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  async function handleClick(n) {
    if (!n.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', n.id)
      fetchNotifications()
    }
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    fetchNotifications()
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ position: 'relative', cursor: 'pointer' }}>
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -6,
            right: -6,
            background: '#c14848',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 700,
            borderRadius: '50%',
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '110%',
          background: 'white',
          color: 'black',
          border: '1px solid #ccc',
          borderRadius: 8,
          width: 280,
          maxHeight: 320,
          overflowY: 'auto',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ padding: 10, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <strong>Notifications</strong>
            <button onClick={markAllRead} style={{ fontSize: '0.75rem' }}>Mark all read</button>
          </div>
          {notifications.length === 0 && (
            <p style={{ padding: 10, fontSize: '0.85rem', color: '#888' }}>No notifications yet.</p>
          )}
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              style={{
                padding: 10,
                fontSize: '0.85rem',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                background: n.is_read ? 'white' : '#f0f8f4'
              }}
            >
              {n.message}
              <div style={{ fontSize: '0.7rem', color: '#999' }}>
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
