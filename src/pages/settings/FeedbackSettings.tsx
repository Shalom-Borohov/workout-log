import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { chatbubbleEllipsesOutline } from 'ionicons/icons'
import { useState } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { SETTINGS_COPY } from './copy'
import { type FeedbackKind, feedbackUrl } from './feedbackUrl'

const isKind = (kind: unknown): kind is FeedbackKind => kind === 'bug' || kind === 'idea'

const PLACEHOLDERS: Record<FeedbackKind, string> = {
  bug: SETTINGS_COPY.bugPlaceholder,
  idea: SETTINGS_COPY.ideaPlaceholder,
}

function FeedbackForm({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState<FeedbackKind>('bug')
  const [text, setText] = useState('')

  function send() {
    window.open(feedbackUrl(kind, text), '_blank')
    onClose()
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>{COMMON_COPY.cancel}</IonButton>
          </IonButtons>
          <IonTitle>{SETTINGS_COPY.report}</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={kind} onIonChange={(event) => isKind(event.detail.value) && setKind(event.detail.value)}>
            <IonSegmentButton value="bug">
              <IonLabel>{SETTINGS_COPY.bug}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="idea">
              <IonLabel>{SETTINGS_COPY.idea}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent color="light">
        <IonList inset>
          <IonItem>
            <IonTextarea
              label={SETTINGS_COPY.description}
              labelPlacement="stacked"
              autoGrow
              rows={5}
              placeholder={PLACEHOLDERS[kind]}
              value={text}
              onIonInput={(event) => typeof event.detail.value === 'string' && setText(event.detail.value)}
            />
          </IonItem>
        </IonList>
        <IonNote className="list-footer">{SETTINGS_COPY.feedbackFooter}</IonNote>
        <IonButton expand="block" className="ion-margin" disabled={text.trim() === ''} onClick={send}>
          {SETTINGS_COPY.openInGitHub}
        </IonButton>
      </IonContent>
    </>
  )
}

export function FeedbackSettings() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <IonList inset>
        <IonItem button detail={false} onClick={() => setOpen(true)}>
          <IonIcon slot="start" color="primary" icon={chatbubbleEllipsesOutline} />
          <IonLabel>{SETTINGS_COPY.reportBugOrIdea}</IonLabel>
        </IonItem>
      </IonList>
      <IonModal isOpen={open} onDidDismiss={() => setOpen(false)}>
        <FeedbackForm onClose={() => setOpen(false)} />
      </IonModal>
    </>
  )
}
