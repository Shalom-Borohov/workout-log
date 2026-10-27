import { useEffect, useRef } from 'react'

const delay = 600

export function useAutoAdvance(onAdvance: (index: number) => void) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  function cancel() {
    clearTimeout(timer.current)
  }

  function schedule(index: number) {
    cancel()
    timer.current = setTimeout(() => onAdvance(index), delay)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  return { schedule, cancel }
}
