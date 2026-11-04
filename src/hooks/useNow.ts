import { useEffect, useState } from 'react'

export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const refresh = () => setNow(Date.now())
    const refreshWhenVisible = () => document.visibilityState === 'visible' && refresh()
    const timer = setInterval(refresh, intervalMs)

    document.addEventListener('visibilitychange', refreshWhenVisible)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [intervalMs])

  return now
}
