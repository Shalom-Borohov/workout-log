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

function touchAt(target: Element, clientX: number, heldClientX?: number) {
  const landed = { clientX }
  const touch = new Event('touchstart', { bubbles: true, cancelable: true, composed: true })
  const onScreen = heldClientX === undefined ? [landed] : [{ clientX: heldClientX }, landed]

  Object.defineProperty(touch, 'touches', { value: onScreen })
  Object.defineProperty(touch, 'changedTouches', { value: [landed] })
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

  it('blocks a second finger that lands at the edge while the first is held mid-screen', () => {
    const { text } = renderFixture()
    release = blockSystemEdgeSwipe(document)

    expect(touchAt(text, SCREEN_WIDTH - INSIDE_EDGE, SCREEN_WIDTH / 2).defaultPrevented).toBe(true)
  })

  it('blocks two fingers landing together when one of them is at the edge', () => {
    const { text } = renderFixture()
    release = blockSystemEdgeSwipe(document)
    const fingers = [{ clientX: SCREEN_WIDTH / 2 }, { clientX: SCREEN_WIDTH - INSIDE_EDGE }]
    const touch = new Event('touchstart', { bubbles: true, cancelable: true, composed: true })

    Object.defineProperty(touch, 'touches', { value: fingers })
    Object.defineProperty(touch, 'changedTouches', { value: fingers })
    text.dispatchEvent(touch)

    expect(touch.defaultPrevented).toBe(true)
  })

  it('leaves a second finger mid-screen alone while the first is held at the edge', () => {
    const { text } = renderFixture()
    release = blockSystemEdgeSwipe(document)

    expect(touchAt(text, SCREEN_WIDTH / 2, SCREEN_WIDTH - INSIDE_EDGE).defaultPrevented).toBe(false)
  })

  it('keeps taps on a button at the edge working', () => {
    const { button } = renderFixture()
    release = blockSystemEdgeSwipe(document)

    expect(touchAt(button, SCREEN_WIDTH - INSIDE_EDGE).defaultPrevented).toBe(false)
  })

  it('blocks an edge touch on an overlay’s backdrop, so the page can’t move under it', () => {
    renderFixture()
    const sheet = document.createElement('div')
    const backdrop = document.createElement('ion-backdrop')
    sheet.attachShadow({ mode: 'open' }).append(backdrop)
    document.body.append(sheet)
    release = blockSystemEdgeSwipe(document)

    expect(touchAt(backdrop, INSIDE_EDGE).defaultPrevented).toBe(true)
  })

  it('stops blocking once released', () => {
    const { text } = renderFixture()
    blockSystemEdgeSwipe(document)()

    expect(touchAt(text, SCREEN_WIDTH - INSIDE_EDGE).defaultPrevented).toBe(false)
  })
})
