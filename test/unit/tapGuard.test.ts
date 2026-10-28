import { afterEach, describe, expect, it, vi } from 'vitest'
import { guardTapsDuringTransitions } from '../../src/navigation/tapGuard'

function page() {
  document.body.innerHTML = '<ion-router-outlet><div class="ion-page"><ion-content></ion-content></div></ion-router-outlet><button>tap</button>'

  const content = document.querySelector('ion-content')
  const button = document.querySelector('button')

  if (!content || !button) {
    throw new Error('fixture missing')
  }

  return { content, button }
}

function animationsAre(animations: object[]) {
  Object.defineProperty(document, 'getAnimations', { configurable: true, value: () => animations })
}

describe('taps during page transitions', () => {
  let release = () => {}

  afterEach(() => {
    release()
    document.body.innerHTML = ''
  })

  it('swallows a tap while an Ionic page transition is still running', () => {
    const { content, button } = page()
    const tapped = vi.fn()
    button.addEventListener('click', tapped)
    release = guardTapsDuringTransitions(document)
    animationsAre([{ playState: 'running', effect: { target: content } }])

    button.click()

    expect(tapped).not.toHaveBeenCalled()
  })

  it('lets taps through once the transition finished', () => {
    const { content, button } = page()
    const tapped = vi.fn()
    button.addEventListener('click', tapped)
    release = guardTapsDuringTransitions(document)
    animationsAre([{ playState: 'finished', effect: { target: content } }])

    button.click()

    expect(tapped).toHaveBeenCalledOnce()
  })

  it('ignores the app’s own CSS animations', () => {
    const { content, button } = page()
    const tapped = vi.fn()
    button.addEventListener('click', tapped)
    release = guardTapsDuringTransitions(document)
    animationsAre([{ playState: 'running', animationName: 'item-enter-next', effect: { target: content } }])

    button.click()

    expect(tapped).toHaveBeenCalledOnce()
  })

  it('ignores running animations outside the page outlets, such as sheets', () => {
    const { button } = page()
    const tapped = vi.fn()
    button.addEventListener('click', tapped)
    release = guardTapsDuringTransitions(document)
    animationsAre([{ playState: 'running', effect: { target: button } }])

    button.click()

    expect(tapped).toHaveBeenCalledOnce()
  })
})
