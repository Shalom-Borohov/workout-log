import { fireEvent } from '@testing-library/react'

type Point = { x: number; y: number }

export function drag(target: Element, from: Point, to: Point) {
  const steps = 5

  fireEvent.mouseDown(target, { clientX: from.x, clientY: from.y })
  for (let step = 1; step <= steps; step++) {
    const clientX = from.x + ((to.x - from.x) * step) / steps
    const clientY = from.y + ((to.y - from.y) * step) / steps

    fireEvent.mouseMove(document, { clientX, clientY })
  }
  fireEvent.mouseUp(document, { clientX: to.x, clientY: to.y })
}
