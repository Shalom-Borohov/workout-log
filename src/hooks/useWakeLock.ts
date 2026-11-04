import { useEffect } from 'react'

export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) {
      return
    }
    const { wakeLock } = navigator
    let sentinel: WakeLockSentinel | null = null
    let disposed = false

    async function request() {
      try {
        const lock = await wakeLock.request('screen')

        if (disposed) {
          await lock.release()
        } else {
          sentinel = lock
        }
      } catch {
        sentinel = null
      }
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        void request()
      }
    }

    void request()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', onVisibility)
      void sentinel?.release()
    }
  }, [active])
}
