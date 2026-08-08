import { useRef, useState } from 'react'

export function useRateLimit(cooldownMs = 3000) {
  const lastSubmitRef = useRef(0)
  const [blocked, setBlocked] = useState(false)

  function attempt() {
    const now = Date.now()
    if (now - lastSubmitRef.current < cooldownMs) {
      setBlocked(true)
      setTimeout(() => setBlocked(false), cooldownMs)
      return false
    }
    lastSubmitRef.current = now
    return true
  }

  return { attempt, blocked }
}
