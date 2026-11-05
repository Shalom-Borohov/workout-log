import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BodyAreaIcon } from '../../src/components/bodyArea/BodyAreaIcon'
import { BodyAreaPicker } from '../../src/components/bodyArea/BodyAreaPicker'
import { AREA_CHOICES } from '../../src/domain/bodyAreas'
import { expectInOrder, radioByLabel } from '../helpers/ionic'

const OPTIONS = ['כתפיים', 'חזה', 'גב', 'ידיים', 'בטן', 'ישבן', 'רגליים', 'גוף מלא', 'קרדיו', 'מתיחות', 'ללא']

function icon(container: HTMLElement) {
  const svg = container.querySelector('svg')

  if (!svg) {
    throw new Error('no body area icon')
  }

  return svg
}

describe('body area icon', () => {
  it('draws the area as lines, hidden from assistive tech', () => {
    const svg = icon(render(<BodyAreaIcon area="chest" />).container)

    expect(svg.querySelectorAll('path').length).toBeGreaterThan(0)
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('data-area', 'chest')
  })

  it('draws a different picture for every area and for none', () => {
    const pictures = AREA_CHOICES.map((area) => icon(render(<BodyAreaIcon area={area} />).container).innerHTML)

    expect(new Set(pictures).size).toBe(AREA_CHOICES.length)
  })

  it('marks an exercise with no area as none', () => {
    const svg = icon(render(<BodyAreaIcon area={null} />).container)

    expect(svg).toHaveAttribute('data-area', 'none')
  })
})

describe('body area picker', () => {
  it('offers every area and then none, each a labelled radio with an icon', async () => {
    render(<BodyAreaPicker value={null} onChange={() => {}} />)

    const group = screen.getByRole('group', { name: 'אזור בגוף' })

    expect(screen.getAllByRole('radio')).toHaveLength(11)
    OPTIONS.forEach((label) => expect(screen.getByRole('radio', { name: label })).toBeInTheDocument())
    await expectInOrder(OPTIONS)
    expect(group.querySelectorAll('svg.body-area-icon')).toHaveLength(11)
  })

  it('checks the current area', async () => {
    render(<BodyAreaPicker value="glutes" onChange={() => {}} />)

    expect(await radioByLabel('ישבן')).toBeChecked()
    expect(screen.getAllByRole('radio').filter((radio) => radio.matches(':checked'))).toHaveLength(1)
  })

  it('checks none when no area is set', async () => {
    render(<BodyAreaPicker value={null} onChange={() => {}} />)

    expect(await radioByLabel('ללא')).toBeChecked()
  })

  it('reports the tapped area', async () => {
    const onChange = vi.fn()

    render(<BodyAreaPicker value={null} onChange={onChange} />)
    fireEvent.click(await radioByLabel('רגליים'))

    expect(onChange).toHaveBeenCalledWith('legs')
  })

  it('reports no area when none is tapped', async () => {
    const onChange = vi.fn()

    render(<BodyAreaPicker value="chest" onChange={onChange} />)
    fireEvent.click(await radioByLabel('ללא'))

    expect(onChange).toHaveBeenCalledWith(null)
  })
})
