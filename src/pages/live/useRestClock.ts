import { formatClock } from '../../domain/format'
import { SECOND_MS } from '../../domain/time'
import { useNow } from '../../hooks/useNow'
import type { Rest } from '../../rest/restClock'

export function useRestClock(rest: Rest): string {
  const now = useNow(SECOND_MS)
  const secondsLeft = Math.ceil(Math.max(rest.endsAt - now, 0) / SECOND_MS)

  return formatClock(secondsLeft * SECOND_MS)
}
