import { vi } from 'vitest'

export function mockShare() {
  const share = vi.fn<(data: ShareData) => Promise<void>>().mockResolvedValue()

  Object.assign(navigator, { share, canShare: () => true })

  return share
}

export async function sharedFileText(share: ReturnType<typeof mockShare>) {
  const [data] = share.mock.calls[0]
  const [file] = data.files ?? []

  return file.text()
}
