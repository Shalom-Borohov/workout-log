import { IonButton } from '@ionic/react'
import { useState } from 'react'
import { COMMON_COPY } from '../../copy/common'
import type { Activity } from '../../domain/types'
import { ActivityModal } from './ActivityModal'

export function ActivityEditButton({ activity }: { activity: Activity }) {
  const [editing, setEditing] = useState(false)

  return (
    <>
      <IonButton onClick={() => setEditing(true)}>{COMMON_COPY.edit}</IonButton>
      <ActivityModal isOpen={editing} activity={activity} onClose={() => setEditing(false)} />
    </>
  )
}
