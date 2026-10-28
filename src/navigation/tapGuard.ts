const isKeyframeEffect = (effect: AnimationEffect | null): effect is KeyframeEffect => effect !== null && 'target' in effect

const isCssAnimation = (animation: Animation) => 'animationName' in animation || 'transitionProperty' in animation

function isPageTransition(animation: Animation): boolean {
  const { effect } = animation

  return (
    animation.playState === 'running' &&
    !isCssAnimation(animation) &&
    isKeyframeEffect(effect) &&
    effect.target?.closest('ion-router-outlet') != null
  )
}

export function guardTapsDuringTransitions(root: Document): () => void {
  function swallow(event: MouseEvent) {
    if (root.getAnimations().some(isPageTransition)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  root.addEventListener('click', swallow, true)

  return () => root.removeEventListener('click', swallow, true)
}
