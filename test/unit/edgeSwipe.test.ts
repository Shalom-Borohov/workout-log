import { afterEach, describe, expect, it } from 'vitest'
import { blockSystemEdgeSwipe } from '../../src/navigation/edgeSwipe'

const SCREEN_WIDTH = 390

const INSIDE_EDGE = 5

const OUTSIDE_EDGE = 40

function renderFixture() {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: SCREEN_WIDTH })
  document.body.innerHTML = '<div class="content"><p>text</p><ion-button>tap</ion-button></div>'

  const text = document.querySelector('p')
  const button = document.querySelector('ion-button')

  if (!text || !button) {
    throw new Error('fixture missing')
  }

  return { text, button }
}

function touchAt(target: Element, clientX: number) {
  const touch = new Event('touchstart', { bubbles: true, cancelable: true, composed: true })
  Object.defineProperty(touch, 'touches', { value: [{ clientX }] })
  target.dispatchEvent(touch)

  return touch
}

describe('blocking the iPhone’s own edge swipe', () => {
  let release = () => {}

  afterEach(() => {
    release()
    document.body.innerHTML = ''
  })

  it('blocks a touch that starts at the right edge', () => {
    const { text } = renderFixture()
    release = blockSystemEdgeSwipe(document)

    expect(touchAt(text, SCREEN_WIDTH - INSIDE_EDGE).defaultPrevented).toBe(true)
  })

  it('blocks a touch that starts at the left edge', () => {
    const { text } = renderFixture()
    release = blockSystemEdgeSwipe(document)

    expect(touchAt(text, INSIDE_EDGE).defaultPrevented).toBe(true)
  })

  it('leaves touches away from the edges alone', () => {
    const { text } = renderFixture()
    release = blockSystemEdgeSwipe(document)

    expect(touchAt(text, SCREEN_WIDTH / 2).defaultPrevented).toBe(false)
    expect(touchAt(text, SCREEN_WIDTH - OUTSIDE_EDGE).defaultPrevented).toBe(false)
  })

  it('keeps taps on a button at the edge working', () => {
    const { button } = renderFixture()
    release = blockSystemEdgeSwipe(document)

    expect(touchAt(button, SCREEN_WIDTH - INSIDE_EDGE).defaultPrevented).toBe(false)
  })

  it('keeps taps on a sheet’s backdrop at the edge working', () => {
    renderFixture()
    const sheet = document.createElement('div')
    const backdrop = document.createElement('ion-backdrop')
    sheet.attachShadow({ mode: 'open' }).append(backdrop)
    document.body.append(sheet)
    release = blockSystemEdgeSwipe(document)

    expect(touchAt(backdrop, INSIDE_EDGE).defaultPrevented).toBe(false)
  })

  it('stops blocking once released', () => {
    const { text } = renderFixture()
    blockSystemEdgeSwipe(document)()

    expect(touchAt(text, SCREEN_WIDTH - INSIDE_EDGE).defaultPrevented).toBe(false)
  })
})
