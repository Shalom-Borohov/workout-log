import { IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/react'
import type { ReactNode } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { EXERCISES_PATH } from '../../navigation/paths'
import './exerciseHistory.css'

export function HistoryLayout({ name, children }: { name: string; children: ReactNode }) {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text={COMMON_COPY.back} defaultHref={EXERCISES_PATH} />
          </IonButtons>
          <IonTitle>{name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large" className="exercise-history-title">
              <span className="exercise-history-title-text">{name}</span>
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        {children}
      </IonContent>
    </>
  )
}
