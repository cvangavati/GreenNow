import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

const POST_TYPES = ['update', 'milestone', 'advocacy', 'urgent', 'news', 'personal']
const TYPE_COLORS = {
  update: '#3b5fc4',
  milestone: '#2d9166',
  advocacy: '#8e44ad',
  urgent: '#c14848',
  news: '#d98c2b',
  personal: '#6b7a72'
}

function Badge({ label, color }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      padding: '3px 9px',
      borderRadius: 20,
      background: color,
      color: 'white',
      marginRight: 6
    }}>
      {label}
    </span>
  )
}

function PostCard({ post, currentUserId }) {
  const [comments, setComments] = useState([])
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchExtras()
  }, [post.id])

  async function fetchExtras() {
    const { data: likeData } = await supabase
      .from('post_likes')
      .select('user_id')
      .eq('post_id', post.id)

    setLikeCount(likeData?.length || 0)
    setLiked(likeData?.some(l => l.user_id === currentUserId) || false)

    const { data: commentData } = await supabase
      .from('post_comments')
      .select('*, profiles(name)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })

    setComments(commentData || [])
  }

  async function toggleLike() {
    setLoading(true)
    if (liked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
    } else {
      await supabase
        .from('post_likes')
        .insert({ post_id: post.id, user_id: currentUserId })
    }
    await fetchExtras()
    setLoading(false)
  }

  async function submitComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    setLoading(true)
    await supabase
      .from('post_comments')
      .insert({ post_id: post.id, author_id: currentUserId, content: commentText.trim() })

    // Notify the post author, unless they're commenting on their own post
    if (post.author_id !== currentUserId) {
      await supabase.from('notifications').insert({
        user_id: post.author_id,
        type: 'comment',
        message: 'Someone commented on your post.',
        link: '/feed'
      })
    }

    setCommentText('')
    await fetchExtras()
    setLoading(false)
  }

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 10, padding: 14, marginBottom: 14 }}>
      <Badge label={post.type} color={TYPE_COLORS[post.type] || '#888'} />
      <p style={{ margin: '8px 0', fontSize: '0.75rem', color: '#888' }}>
        {post.profiles?.name || 'Someone'} — {new Date(post.created_at).toLocaleString()}
      </p>
      <p style={{ margin: '8px 0' }}>{post.content}</p>

      {post.events?.title && (
        <p style={{ fontSize: '0.8rem', color: '#2d9166', fontWeight: 600 }}>
          🔗 Linked to event: {post.events.title}
        </p>
      )}

      {post.photos?.[0] && (
        <img
          src={post.photos[0]}
          alt="Post attachment"
          style={{ maxWidth: '100%', borderRadius: 8, margin: '8px 0' }}
        />
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
        <button onClick={toggleLike} disabled={loading}>
          {liked ? '💚 Liked' : '🤍 Like'} ({likeCount})
        </button>
        <button onClick={() => setShowComments(!showComments)}>
          💬 {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: 12, borderTop: '1px dashed #eee', paddingTop: 10 }}>
          {comments.map(c => (
            <div key={c.id} style={{ fontSize: '0.85rem', marginBottom: 8 }}>
              <strong>{c.profiles?.name || 'Someone'}</strong>: {c.content}
            </div>
          ))}
          <form onSubmit={submitComment} style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              style={{ flex: 1, padding: 6 }}
            />
            <button type="submit" disabled={loading}>Post</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [events, setEvents] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [type, setType] = useState('update')
  const [photoFile, setPhotoFile] = useState(null)
  const [linkedEventId, setLinkedEventId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPosts()
    fetchEvents()
    fetchGroups()
  }, [])

  async function fetchGroups() {
    const { data } = await supabase.from('groups').select('id, name')
    setGroups(data || [])
  }

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('id, title')
      .order('created_at', { ascending: false })
    setEvents(data || [])
  }

  async function fetchPosts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(name), events(title)')
      .order('created_at', { ascending: false })

    if (error) console.error('Fetch error:', error)
    else setPosts(data)
    setLoading(false)
  }

  async function handlePost(e) {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true)
    setError(null)

    let photoUrls = []

    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('post-photos')
        .upload(filePath, photoFile)

      if (uploadError) {
        setError('Photo upload failed: ' + uploadError.message)
        setPosting(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('post-photos')
        .getPublicUrl(filePath)

      photoUrls = [urlData.publicUrl]
    }

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        type,
        content: content.trim(),
        photos: photoUrls,
        linked_event_id: linkedEventId || null,
        group_id: groupId || null
      })
      .select()
      .single()

    setPosting(false)

    if (error) {
      setError(error.message)
      return
    }

    // Notify other group members, if this post was made in a group
    if (groupId) {
      const { data: members } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)

      const otherMembers = (members || []).filter(m => m.user_id !== user.id)

      if (otherMembers.length > 0) {
        const notifications = otherMembers.map(m => ({
          user_id: m.user_id,
          type: 'group_post',
          message: 'New post in a group you follow.',
          link: `/groups/${groupId}`
        }))
        await supabase.from('notifications').insert(notifications)
      }
    }

    setContent('')
    setPhotoFile(null)
    setLinkedEventId('')
    setGroupId('')
    await fetchPosts()
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: 700, margin: '0 auto' }}>
      <h1>Community Feed</h1>

      <form onSubmit={handlePost} style={{ marginBottom: 24, border: '1px solid #ccc', borderRadius: 10, padding: 14 }}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share an update, milestone, or something on your mind..."
          rows={3}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={type} onChange={e => setType(e.target.value)}>
            {POST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={e => setPhotoFile(e.target.files[0])}
          />
          <select value={linkedEventId} onChange={e => setLinkedEventId(e.target.value)}>
            <option value="">Not linked to an event</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>Link to: {ev.title}</option>
            ))}
          </select>
          <select value={groupId} onChange={e => setGroupId(e.target.value)}>
            <option value="">Not posted to a group</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>Post to: {g.name}</option>
            ))}
          </select>
          <button type="submit" disabled={posting}>
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      {loading && <p>Loading feed...</p>}
      {!loading && posts.length === 0 && <p>No posts yet. Be the first to share something!</p>}

      {posts.map(post => (
        <PostCard key={post.id} post={post} currentUserId={user.id} />
      ))}
    </div>
  )
}