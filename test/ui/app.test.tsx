import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAt } from '../helpers/renderAt'

const tabLabel = { selector: 'ion-tab-button ion-label' }

describe('app shell', () => {
  it('opens on the timeline with the three tabs', async () => {
    renderAt('/')

    expect(await screen.findByText('ציר זמן', tabLabel)).toBeInTheDocument()
    expect(screen.getByText('אימונים', tabLabel)).toBeInTheDocument()
    expect(screen.getByText('תרגילים', tabLabel)).toBeInTheDocument()
    expect(await screen.findAllByText('ציר זמן', { selector: 'ion-title' })).not.toHaveLength(0)
  })
})
