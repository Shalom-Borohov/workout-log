import { fireEvent, waitFor } from '@testing-library/react'
import { barbell, barbellOutline, calendar, calendarOutline, readerOutline, timeOutline } from 'ionicons/icons'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from '../helpers/db'
import { iconOf } from '../helpers/icons'
import { currentPath, renderAt } from '../helpers/renderAt'

function tabButton(tab: string): Element {
  const button = document.querySelector(`ion-tab-button[tab="${tab}"]`)

  if (!button) {
    throw new Error(`no tab button ${tab}`)
  }

  return button
}

const tabIcons = () => ['timeline', 'daily', 'routines', 'exercises'].map((tab) => iconOf(tabButton(tab)))

describe('tab bar', () => {
  beforeEach(resetDb)

  it('fills the icon of the open tab and outlines the others', async () => {
    renderAt('/tabs/daily')

    await waitFor(() => expect(tabIcons()).toEqual([timeOutline, calendar, readerOutline, barbellOutline]))

    fireEvent.click(tabButton('exercises'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/exercises'))
    await waitFor(() => expect(tabIcons()).toEqual([timeOutline, calendarOutline, readerOutline, barbell]))
  })
})
