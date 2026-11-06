import type { InputCustomEvent } from '@ionic/react'

export function commitName(event: InputCustomEvent, current: string, rename: (name: string) => void) {
  const { value } = event.detail

  if (typeof value !== 'string') {
    return
  }

  const name = value.trim() || current

  event.target.value = name

  if (name !== current) {
    rename(name)
  }
}
