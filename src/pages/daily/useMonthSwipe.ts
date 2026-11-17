import { type TouchEvent, useRef } from 'react'
import { startsAtEdge } from '../../navigation/edgeSwipe'

const MIN_SWIPE = 50

const SIDEWAYS_RATIO = 1.5

export function useMonthSwipe(onMonthsBack: (change: number) => void) {
  const start = useRef<{ finger: number; x: number; y: number } | null>(null)

  function onTouchStart(event: TouchEvent) {
    const touch = event.changedTouches[0]

    start.current = startsAtEdge(touch.clientX, window.innerWidth)
      ? null
      : { finger: touch.identifier, x: touch.clientX, y: touch.clientY }
  }

  function onTouchEnd(event: TouchEvent) {
    const from = start.current
    const touch = Array.from(event.changedTouches).find((ended) => ended.identifier === from?.finger)

    if (!from || !touch) {
      return
    }
    start.current = null
    const deltaX = touch.clientX - from.x
    const deltaY = touch.clientY - from.y

    if (Math.abs(deltaX) >= MIN_SWIPE && Math.abs(deltaX) >= Math.abs(deltaY) * SIDEWAYS_RATIO) {
      onMonthsBack(deltaX < 0 ? 1 : -1)
    }
  }

  return { onTouchStart, onTouchEnd }
}
