import { errorMessage } from './toast'

export async function shareFile(name: string, type: string, content: string): Promise<void> {
  const file = new File([content], name, { type })

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] })

    return
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')

  link.href = url
  link.download = file.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url))
}

const isShareCancel = (error: unknown) => error instanceof DOMException && error.name === 'AbortError'

export const shareFailure = (error: unknown) => (isShareCancel(error) ? null : errorMessage(error))
