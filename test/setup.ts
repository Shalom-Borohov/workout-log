import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import { setupIonicReact } from '@ionic/react'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { saveSeenVersion } from '../src/data/seenVersion'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: NoopIntersectionObserver })

Object.defineProperty(Element.prototype, 'scrollTo', { writable: true, value: () => {} })

setupIonicReact({ mode: 'ios' })

beforeEach(() => {
  saveSeenVersion(__APP_VERSION__)
})

afterEach(() => {
  cleanup()
})
