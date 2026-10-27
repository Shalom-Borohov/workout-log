import { formatClock } from '../domain/format'
import { useNow } from '../hooks/useNow'

export function ElapsedClock({ startedAt, className }: { startedAt: number; className?: string }) {
  const now = useNow(1000)

  return <span className={className}>{formatClock(now - startedAt)}</span>
}
