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
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [type, setType] = useState('update')
  const [photoFile, setPhotoFile] = useState(null)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(name)')
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

    const { error } = await supabase
      .from('posts')
      .insert({ author_id: user.id, type, content: content.trim(), photos: photoUrls })

    setPosting(false)

    if (error) {
      setError(error.message)
      return
    }

    setContent('')
    setPhotoFile(null)
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