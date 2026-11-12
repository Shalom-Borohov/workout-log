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
  useIonToast,
} from '@ionic/react'
import { chatbubbleEllipsesOutline } from 'ionicons/icons'
import { useState } from 'react'
import { TOAST_OPTIONS } from '../../components/toast'
import { COMMON_COPY } from '../../copy/common'
import { ignoreTapsFor } from '../../navigation/tapGuard'
import { SETTINGS_COPY } from './copy'
import { type FeedbackKind, feedbackUrl, fitsInLink } from './feedbackUrl'
import { usePhoneStorage } from './usePhoneStorage'
import './feedback.css'

const REPEAT_TAPS_IGNORED_MS = 300

const isKind =(kind: unknown): kind is FeedbackKind => kind === 'bug' || kind === 'idea'

const PLACEHOLDERS: Record<FeedbackKind, string> = {
  bug: SETTINGS_COPY.bugPlaceholder,
  idea: SETTINGS_COPY.ideaPlaceholder,
}

function FeedbackForm({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState<FeedbackKind>('idea')
  const [text, setText] = useState('')
  const [tapped, setTapped] = useState(false)
  const [presentToast] = useIonToast()
  const storage = usePhoneStorage()
  const url = feedbackUrl(kind, text, storage)
  const tooLong = !fitsInLink(url)

  function send() {
    setTapped(true)
    ignoreTapsFor(REPEAT_TAPS_IGNORED_MS)

    if (!window.open(url, '_blank')) {
      void presentToast({ message: SETTINGS_COPY.feedbackNotOpened, ...TOAST_OPTIONS })
    }
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>{tapped ? COMMON_COPY.done : COMMON_COPY.cancel}</IonButton>
          </IonButtons>
          <IonTitle>{SETTINGS_COPY.report}</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment
            className="feedback-kind"
            value={kind}
            onIonChange={(event) => isKind(event.detail.value) && setKind(event.detail.value)}
          >
            <IonSegmentButton value="bug">
              <IonLabel>{SETTINGS_COPY.bug}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="idea">
              <IonLabel>{SETTINGS_COPY.idea}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
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
        <IonNote role="status" className="list-footer" color={tooLong ? 'danger' : undefined}>
          {tooLong ? SETTINGS_COPY.feedbackTooLong : SETTINGS_COPY.feedbackFooter}
        </IonNote>
        <IonButton expand="block" className="feedback-send" disabled={text.trim() === '' || tooLong} onClick={send}>
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
          <IonIcon slot="start" color="primary" icon={chatbubbleEllipsesOutline} aria-hidden="true" />
          <IonLabel>{SETTINGS_COPY.reportBugOrIdea}</IonLabel>
        </IonItem>
      </IonList>
      <IonModal isOpen={open} onDidDismiss={() => setOpen(false)}>
        <FeedbackForm onClose={() => setOpen(false)} />
      </IonModal>
    </>
  )
}
