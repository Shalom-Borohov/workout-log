import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { AccentSettings } from '../../src/pages/settings/AccentSettings'
import { resetDb } from '../helpers/db'
import { expectInOrder, radioByLabel } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'

describe('accent colour in Settings', () => {
  beforeEach(resetDb)

  it('offers six colours above the background photo, with orange chosen', async () => {
    renderAt('/tabs/routines/settings')

    const group = await screen.findByRole('group', { name: 'צבע' })

    const names = within(group)
      .getAllByRole('radio')
      .map((radio) => radio.getAttribute('aria-label'))

    expect(names).toEqual(['כתום', 'טורקיז', 'כחול', 'אינדיגו', 'סגול', 'ורוד'])
    expect(await radioByLabel('כתום')).toBeChecked()
    await expectInOrder(['צבע', 'רקע'])
  })

  it('applies a chosen colour at once and keeps it after the app reopens', async () => {
    const { unmount } = renderAt('/tabs/routines/settings')

    fireEvent.click(await radioByLabel('כחול'))

    expect(await radioByLabel('כחול')).toBeChecked()
    expect(document.documentElement.style.getPropertyValue('--app-accent')).toBe('var(--app-accent-blue)')

    unmount()
    renderAt('/tabs/routines/settings')

    expect(await radioByLabel('כחול')).toBeChecked()
  })

  it('rings the chosen colour on the other tab’s Settings page too', async () => {
    render(
      <>
        <AccentSettings />
        <AccentSettings />
      </>,
    )

    const [first, second] = await screen.findAllByRole('group', { name: 'צבע' })

    fireEvent.click(within(first).getByLabelText('סגול'))

    expect(within(second).getByLabelText('סגול')).toBeChecked()
  })
})
