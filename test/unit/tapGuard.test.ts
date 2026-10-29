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

function timelineAt(currentTime: number) {
  Object.defineProperty(document, 'timeline', { configurable: true, value: { currentTime } })
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
    timelineAt(1000)
    animationsAre([{ playState: 'running', startTime: 900, effect: { target: content } }])

    button.click()

    expect(tapped).not.toHaveBeenCalled()
  })

  it('lets taps through when a transition has been "running" longer than any transition lasts', () => {
    const { content, button } = page()
    const tapped = vi.fn()
    button.addEventListener('click', tapped)
    release = guardTapsDuringTransitions(document)
    timelineAt(60_000)
    animationsAre([{ playState: 'running', startTime: 1000, effect: { target: content } }])

    button.click()

    expect(tapped).toHaveBeenCalledOnce()
  })

  it('blocks taps only briefly for a transition that never gets a start time', () => {
    const { content, button } = page()
    const tapped = vi.fn()
    button.addEventListener('click', tapped)
    release = guardTapsDuringTransitions(document)
    const clock = vi.spyOn(performance, 'now').mockReturnValue(1000)
    animationsAre([{ playState: 'running', startTime: null, effect: { target: content } }])

    button.click()
    clock.mockReturnValue(61_000)
    button.click()

    expect(tapped).toHaveBeenCalledOnce()
    clock.mockRestore()
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
