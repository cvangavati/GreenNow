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
    if (!user) {
      setNotifications([])
      return
    }

    fetchNotifications()
    const interval = window.setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => window.clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  async function fetchNotifications() {
    if (!user) return

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
    if (!user) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    fetchNotifications()
  }

  return (
    <div className="notification-shell">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="notification-trigger"
        aria-label={unreadCount ? `Open notifications, ${unreadCount} unread` : 'Open notifications'}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="notifications-menu"
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge" aria-label={`${unreadCount} unread notifications`}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div id="notifications-menu" className="notification-panel" role="menu" aria-label="Notifications">
          <div className="notification-panel__header">
            <strong>Notifications</strong>
            <button type="button" className="notification-action" onClick={markAllRead}>
              Mark all read
            </button>
          </div>
          {notifications.length === 0 && (
            <p className="notification-empty">No notifications yet.</p>
          )}
          {notifications.map(n => (
            <button
              key={n.id}
              type="button"
              className={`notification-item${n.is_read ? '' : ' notification-item--unread'}`}
              role="menuitem"
              onClick={() => handleClick(n)}
            >
              <span>{n.message}</span>
              <span className="notification-item__meta">{new Date(n.created_at).toLocaleString()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
