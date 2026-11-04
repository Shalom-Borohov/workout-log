import { type TouchEvent, useRef } from 'react'

const MIN_SWIPE = 50

const SIDEWAYS_RATIO = 1.5

export function useMonthSwipe(onMonthsBack: (change: number) => void) {
  const start = useRef<{ x: number; y: number } | null>(null)

  function onTouchStart(event: TouchEvent) {
    const touch = event.touches[0]

    start.current = { x: touch.clientX, y: touch.clientY }
  }

  function onTouchEnd(event: TouchEvent) {
    const from = start.current
    const touch = event.changedTouches[0]

    start.current = null
    if (!from) {
      return
    }
    const dx = touch.clientX - from.x
    const dy = touch.clientY - from.y

    if (Math.abs(dx) >= MIN_SWIPE && Math.abs(dx) >= Math.abs(dy) * SIDEWAYS_RATIO) {
      onMonthsBack(dx < 0 ? 1 : -1)
    }
  }

  return { onTouchStart, onTouchEnd }
}
