import type { SearchbarInputEventDetail } from '@ionic/react'
import { useState } from 'react'

export function useSearch() {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()

  const matches = (name: string) => name.toLowerCase().includes(needle)

  function onInput({ value }: SearchbarInputEventDetail) {
    if (typeof value === 'string') {
      setQuery(value)
    }
  }

  return { query, matches, onInput, clear: () => setQuery('') }
}
