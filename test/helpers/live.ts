import { act, fireEvent, screen } from '@testing-library/react'
import type { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import { actionSheetPresented, ionElement } from './ionic'

type User = ReturnType<typeof userEvent.setup>

export const heading = (name: string) => screen.findByText(name, { selector: 'h1' })

export const pause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

export const cardButton = (text: string) => screen.findByText(text, { selector: '.item-actions ion-button' })

export const restButton = () => document.querySelector('ion-button.rest-button')

export const openRest = async (user: User) => user.click(await ionElement('ion-button.rest-button'))

export async function openMenu() {
  const presented = actionSheetPresented()

  fireEvent.click(await screen.findByLabelText('פעולות לתרגיל'))
  await presented

  return Array.from(document.querySelectorAll('.action-sheet-button'), (button) => button.textContent)
}

export async function chooseFromMenu(text: string) {
  await openMenu()
  fireEvent.click(screen.getByText(text, { selector: '.action-sheet-button-label' }))
}

export async function tickSquat(user: User, set: number) {
  await user.click(await screen.findByRole('button', { name: `סקוואט סט ${set}`, pressed: false }))
}

export function spyPlayed() {
  const played: boolean[] = []

  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
    played.push(this.muted)

    return Promise.resolve()
  })

  return played
}

export async function setVisibility(state: DocumentVisibilityState) {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state)
  await act(async () => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
}
