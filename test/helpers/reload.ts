import { vi } from 'vitest'

export function spyOnReload() {
  const real = window.location
  const reload = vi.fn()

  vi.spyOn(window, 'location', 'get').mockReturnValue({
    ...real,
    reload,
    get hash() {
      return real.hash
    },
    set hash(value: string) {
      real.hash = value
    },
  })

  return reload
}
