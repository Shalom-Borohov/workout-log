import { useState } from 'react'
import { readSeenVersion, saveSeenVersion } from '../data/seenVersion'
import { unseenReleases } from '../domain/releases'
import { CHANGELOG } from './changelog'

export function useWhatsNew(inWorkout: boolean) {
  const [releases] = useState(() => unseenReleases(CHANGELOG, readSeenVersion(), __APP_VERSION__))
  const [closed, setClosed] = useState(false)

  function close() {
    saveSeenVersion(__APP_VERSION__)
    setClosed(true)
  }

  return { releases, isOpen: releases.length > 0 && !closed && !inWorkout, close }
}
