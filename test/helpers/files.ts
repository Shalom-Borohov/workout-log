import { fireEvent } from '@testing-library/react'

export function chooseFile(input: HTMLElement, text: string) {
  fireEvent.change(input, { target: { files: [new File([text], 'backup.json', { type: 'application/json' })] } })
}
