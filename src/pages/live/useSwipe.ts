import { createGesture, type GestureDetail } from '@ionic/react'
import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react'

const EDGE = 50

const DISTANCE = 50

type SwipeConfig = {
  direction: 'x' | 'y'
  canStart: (detail: GestureDetail) => boolean
  onEnd: (deltaX: number, deltaY: number) => void
}

function useGesture(element: RefObject<HTMLElement | null>, name: string, config: SwipeConfig) {
  const latest = useRef(config)

  useEffect(() => {
    latest.current = config
  })

  useLayoutEffect(() => {
    const target = element.current

    if (!target) {
      return
    }
    const gesture = createGesture({
      el: target,
      gestureName: name,
      direction: latest.current.direction,
      canStart: (detail) => latest.current.canStart(detail),
      onEnd: (detail) => latest.current.onEnd(detail.deltaX, detail.deltaY),
    })

    gesture.enable()

    return () => gesture.destroy()
  }, [element, name])
}

function isRtl() {
  return document.documentElement.dir === 'rtl'
}

export function useItemSwipe(element: RefObject<HTMLElement | null>, onSwipe: (step: 1 | -1) => void) {
  useGesture(element, 'item-swipe', {
    direction: 'x',
    canStart: ({ startX }) => (isRtl() ? startX < window.innerWidth - EDGE : startX > EDGE),
    onEnd: (deltaX) => {
      if (Math.abs(deltaX) >= DISTANCE) {
        onSwipe(deltaX > 0 === isRtl() ? 1 : -1)
      }
    },
  })
}

export function useSwipeUp(element: RefObject<HTMLElement | null>, onSwipeUp: () => void) {
  useGesture(element, 'swipe-up', {
    direction: 'y',
    canStart: () => true,
    onEnd: (_, deltaY) => {
      if (deltaY <= -DISTANCE) {
        onSwipeUp()
      }
    },
  })
}
