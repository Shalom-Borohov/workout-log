import { within } from '@testing-library/react'
import { ionElement, OPEN_MODAL } from './ionic'

export const pickerSearch = () => ionElement('ion-searchbar', OPEN_MODAL)

async function pickerModal() {
  const modal = (await pickerSearch()).closest('ion-modal')

  if (!(modal instanceof HTMLElement)) {
    throw new Error('exercise picker not found')
  }

  return modal
}

export const exercisePicker = async () => within(await pickerModal())

export async function pickerRows() {
  const rows = (await pickerModal()).querySelectorAll('ion-item')

  return Array.from(rows, (row) => Array.from(row.querySelectorAll('ion-label, ion-note'), (part) => part.textContent).join(' '))
}
