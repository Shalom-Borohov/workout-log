import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { HALF_SHEET } from '../components/sheet'
import { COMMON_COPY } from '../copy/common'
import type { Release } from '../domain/releases'
import { APP_UPDATE_COPY } from './copy'
import './appUpdate.css'

interface WhatsNewSheetProps {
  isOpen: boolean
  releases: Release[]
  onClose: () => void
}

function ChangeList({ title, changes }: { title: string; changes: string[] }) {
  if (changes.length === 0) {
    return null
  }

  return (
    <IonItem>
      <IonLabel className="ion-text-wrap">
        <h3>{title}</h3>
        <ul className="release-changes">
          {changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
      </IonLabel>
    </IonItem>
  )
}

export function WhatsNewSheet({ isOpen, releases, onClose }: WhatsNewSheetProps) {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} {...HALF_SHEET}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{APP_UPDATE_COPY.whatsNew}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>{COMMON_COPY.close}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {releases.map((release) => (
          <IonList inset key={release.version}>
            <IonListHeader>
              <IonLabel>{APP_UPDATE_COPY.releaseTitle(release.version)}</IonLabel>
            </IonListHeader>
            <ChangeList title={APP_UPDATE_COPY.features} changes={release.features} />
            <ChangeList title={APP_UPDATE_COPY.fixes} changes={release.fixes} />
          </IonList>
        ))}
      </IonContent>
    </IonModal>
  )
}
