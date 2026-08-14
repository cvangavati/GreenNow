import { useEffect, useRef, useState } from 'react'

export function useFormGuard({ minSubmitTimeMs = 800 } = {}) {
  const startedAt = useRef(0)
  const [website, setWebsite] = useState('')

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  function validateSubmission() {
    if (website.trim()) {
      return 'We could not process this submission. Please try again.'
    }

    if (Date.now() - startedAt.current < minSubmitTimeMs) {
      return 'Please take a moment to review the form before submitting.'
    }

    return null
  }

  return { website, setWebsite, validateSubmission }
}
