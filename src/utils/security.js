export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
])

export function validateImageFile(file) {
  if (!file) return null

  if (!IMAGE_MIME_TYPES.has(file.type)) {
    return 'Please choose a JPG, PNG, WebP, or GIF image.'
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return 'Please choose an image smaller than 5 MB.'
  }

  return null
}

export function escapeMapText(value, fallback = '') {
  return String(value ?? fallback)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function safeEventId(value) {
  return encodeURIComponent(String(value ?? ''))
}
