import { IonIcon } from '@ionic/react'
import { timerOutline } from 'ionicons/icons'
import type { Rest } from '../../rest/restClock'
import { LIVE_COPY } from './copy'
import { useRestClock } from './useRestClock'

function RestLeft({ rest }: { rest: Rest }) {
  return LIVE_COPY.restLeft(useRestClock(rest))
}

export function RestPill({ rest }: { rest: Rest }) {
  return (
    <span className={rest.ended ? 'pill rest-pill rest-pill-ended' : 'pill rest-pill'}>
      <IonIcon icon={timerOutline} aria-hidden="true" />
      {rest.ended ? LIVE_COPY.restOver : <RestLeft rest={rest} />}
    </span>
  )
}
