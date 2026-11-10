import { fireEvent, screen, waitFor } from '@testing-library/react'
import { expect } from 'vitest'

export function ionEvent(element: Element, name: 'ionChange' | 'ionInput' | 'ionReorderEnd', detail: object) {
  fireEvent(element, new CustomEvent(name, { detail, bubbles: true }))
}

export const ionChange = (element: Element, value: string) => ionEvent(element, 'ionChange', { value })

export const ionInput = (element: Element, value: string) => ionEvent(element, 'ionInput', { value })

export async function ionField(label: string) {
  const native = await screen.findByLabelText(label)
  const field = native.closest('ion-input, ion-textarea, ion-searchbar')

  if (!field) {
    throw new Error(`no Ionic field labelled ${label}`)
  }

  return field
}

const VISIBLE_PAGE = '.ion-page:not(.ion-page-hidden)'

export const OPEN_MODAL = 'ion-modal.show-modal'

export function visibleAll(selector: string) {
  return Array.from(document.querySelectorAll(`${VISIBLE_PAGE} ${selector}`))
}

function presented(event: 'ionActionSheetDidPresent' | 'ionAlertDidPresent' | 'ionModalDidPresent') {
  return new Promise((resolve) => {
    document.addEventListener(event, resolve, { once: true })
  })
}

export const actionSheetPresented = () => presented('ionActionSheetDidPresent')

export const alertPresented = () => presented('ionAlertDidPresent')

export const modalPresented = () => presented('ionModalDidPresent')

export const toasts = () => Array.from(document.querySelectorAll('ion-toast'), (toast) => toast.message)

export function ionElement(selector: string, scope = VISIBLE_PAGE) {
  return waitFor(() => {
    const element = document.querySelector(`${scope} ${selector}`)

    if (!element) {
      throw new Error(`no element ${selector}`)
    }

    return element
  })
}

export const startTimePicker = () => ionElement('ion-datetime', 'body')

export const radioByLabel = (name: string) => screen.findByLabelText(name, { selector: 'input[type="radio"]' })

export function nativeButton(host: Element) {
  return waitFor(() => {
    const native = host.shadowRoot?.querySelector('button')

    if (!native) {
      throw new Error('ion-button has not rendered')
    }

    return native
  })
}

const hasLabel = (element: Element | null | undefined, label: string) => element?.getAttribute('aria-label') === label

export const queryButtonByLabel = (label: string, scope = VISIBLE_PAGE) =>
  Array.from(document.querySelectorAll(`${scope} ion-button`)).find(
    (button) => hasLabel(button, label) || hasLabel(button.shadowRoot?.querySelector('button'), label),
  )

export function buttonByLabel(label: string, scope = VISIBLE_PAGE) {
  return waitFor(() => {
    const button = queryButtonByLabel(label, scope)

    if (!button) {
      throw new Error(`no button labelled ${label}`)
    }

    return button
  })
}

export async function expectInOrder(texts: string[]) {
  const elements = await Promise.all(texts.map((text) => screen.findByText(text)))

  elements.slice(1).forEach((element, index) => {
    expect(elements[index].compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
}
