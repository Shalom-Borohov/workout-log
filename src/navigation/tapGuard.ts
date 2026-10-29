import { SECOND_MS } from '../domain/time'

const MAX_TRANSITION_MS = SECOND_MS

const firstSeen = new WeakMap<Animation, number>()

const isKeyframeEffect = (effect: AnimationEffect | null): effect is KeyframeEffect => effect !== null && 'target' in effect

const isCssAnimation = (animation: Animation) => 'animationName' in animation || 'transitionProperty' in animation

function runningFor(animation: Animation, root: Document): number {
  const timelineNow = root.timeline.currentTime

  if (typeof animation.startTime === 'number' && typeof timelineNow === 'number') {
    return timelineNow - animation.startTime
  }
  const now = performance.now()
  const seen = firstSeen.get(animation)

  if (seen === undefined) {
    firstSeen.set(animation, now)

    return 0
  }

  return now - seen
}

function isPageTransition(animation: Animation, root: Document): boolean {
  const { effect } = animation

  return (
    animation.playState === 'running' &&
    !isCssAnimation(animation) &&
    isKeyframeEffect(effect) &&
    effect.target?.closest('ion-router-outlet') != null &&
    runningFor(animation, root) < MAX_TRANSITION_MS
  )
}

export function guardTapsDuringTransitions(root: Document): () => void {
  function swallow(event: MouseEvent) {
    if (root.getAnimations().some((animation) => isPageTransition(animation, root))) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  root.addEventListener('click', swallow, true)

  return () => root.removeEventListener('click', swallow, true)
}
