import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuietUnits } from '../../src/components/QuietUnits'

const quietParts = (container: HTMLElement) => Array.from(container.querySelectorAll('.quiet-unit'), (part) => part.textContent)

describe('QuietUnits', () => {
  it('keeps the whole text and marks only what is not a number as quiet', () => {
    const { container } = render(<QuietUnits text="82.5 ק״ג × 8" />)

    expect(container).toHaveTextContent('82.5 ק״ג × 8')
    expect(quietParts(container)).toEqual([' ק״ג × '])
  })

  it('marks a trailing unit', () => {
    const { container } = render(<QuietUnits text="45 שנ׳" />)

    expect(quietParts(container)).toEqual([' שנ׳'])
  })

  it('leaves text with no number as it is', () => {
    const { container } = render(<QuietUnits text="–" />)

    expect(container).toHaveTextContent('–')
    expect(quietParts(container)).toEqual(['–'])
  })
})
