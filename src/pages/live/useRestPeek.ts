import { useEffect, useState } from 'react'

const REST_PEEK_MS = 5000

export function useRestPeek() {
  const [peekedAt, setPeekedAt] = useState<number | null>(null)

  useEffect(() => {
    if (peekedAt === null) {
      return
    }
    const timer = setTimeout(() => setPeekedAt(null), REST_PEEK_MS)

    return () => clearTimeout(timer)
  }, [peekedAt])

  return {
    peeking: peekedAt !== null,
    toggle: () => setPeekedAt((current) => (current === null ? Date.now() : null)),
    keep: () => setPeekedAt(Date.now()),
  }
}
