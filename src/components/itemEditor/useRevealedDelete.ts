import type { RefObject } from 'react'
import { useEffect, useState } from 'react'

export function useRevealedDelete(row: RefObject<HTMLElement | null>) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!revealed) {
      return
    }

    function hideOnTouchElsewhere({ target }: Event) {
      if (!(target instanceof Node && row.current?.contains(target))) {
        setRevealed(false)
      }
    }

    document.addEventListener('pointerdown', hideOnTouchElsewhere, true)

    return () => document.removeEventListener('pointerdown', hideOnTouchElsewhere, true)
  }, [revealed, row])

  return {
    revealed,
    toggle: () => setRevealed((shown) => !shown),
    hide: () => setRevealed(false),
  }
}
