import { type Animation, iosTransitionAnimation, type TransitionOptions } from '@ionic/react'
import { SECOND_MS } from '../domain/time'

const IN_APP_BACK_WINDOW_MS = SECOND_MS

const INSTANT_MS = 1

let lastTapAt: number | null = null

export function isSystemSwipeBack(direction: TransitionOptions['direction'], now: number, tappedAt: number | null): boolean {
  return direction === 'back' && (tappedAt === null || now - tappedAt > IN_APP_BACK_WINDOW_MS)
}

export function trackTaps(root: Document): () => void {
  const remember = () => {
    lastTapAt = performance.now()
  }

  root.addEventListener('click', remember, true)

  return () => root.removeEventListener('click', remember, true)
}

export function pageTransition(baseEl: HTMLElement, opts: TransitionOptions): Animation {
  const swiped = isSystemSwipeBack(opts.direction, performance.now(), lastTapAt)

  return iosTransitionAnimation(baseEl, swiped ? { ...opts, duration: INSTANT_MS } : opts)
}
