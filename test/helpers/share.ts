import { vi } from 'vitest'

export function mockShare() {
  const share = vi.fn<(data: ShareData) => Promise<void>>().mockResolvedValue()

  Object.assign(navigator, { share, canShare: () => true })

  return share
}
