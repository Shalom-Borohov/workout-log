import { useEffect, useRef } from 'react'

const ADVANCE_DELAY_MS = 600

export function useAutoAdvance(onAdvance: (index: number) => void) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  function cancel() {
    clearTimeout(timer.current)
  }

  function schedule(index: number) {
    cancel()
    timer.current = setTimeout(() => onAdvance(index), ADVANCE_DELAY_MS)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  return { schedule, cancel }
}
