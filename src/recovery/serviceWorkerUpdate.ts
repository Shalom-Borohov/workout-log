import { checkNow } from '../appUpdate/updateChecks'

const SKIP_WAITING_MESSAGE = { type: 'SKIP_WAITING' } as const

export function reloadAtStart() {
  window.location.hash = ''
  window.location.reload()
}

export function checkForUpdateOnOpen() {
  if (!('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker
    .getRegistration()
    .then((registration) => registration?.active && checkNow(registration.active.scriptURL, registration))
    .catch(() => {})
}

function applyWaitingUpdate(waiting: ServiceWorker) {
  window.location.hash = ''
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true })
  waiting.postMessage(SKIP_WAITING_MESSAGE)
}

export function reloadIntoLatest() {
  if (!('serviceWorker' in navigator)) {
    reloadAtStart()

    return
  }

  void navigator.serviceWorker
    .getRegistration()
    .then((registration) => (registration?.waiting ? applyWaitingUpdate(registration.waiting) : reloadAtStart()), reloadAtStart)
}
