import { formatClock } from '../domain/format'
import { SECOND_MS } from '../domain/time'
import { useNow } from '../hooks/useNow'

export function ElapsedClock({ startedAt, className }: { startedAt: number; className?: string }) {
  const now = useNow(SECOND_MS)

  return <span className={className}>{formatClock(now - startedAt)}</span>
}
