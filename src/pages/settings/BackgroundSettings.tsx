import { IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonNote } from '@ionic/react'
import { imageOutline, trashOutline } from 'ionicons/icons'
import { type ChangeEvent, useRef } from 'react'
import { SETTINGS_COPY } from './copy'
import { clearBackground, setBackground } from '../../data/background'
import { useBackground } from '../../data/hooks'
import { shrinkPhoto } from './shrinkPhoto'

export function BackgroundSettings({ onError }: { onError: (error: unknown) => void }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const background = useBackground()

  async function choose(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]

    input.value = ''

    if (!file) {
      return
    }

    try {
      await setBackground(await shrinkPhoto(file))
    } catch (error) {
      onError(error)
    }
  }

  return (
    <>
      <IonListHeader>
        <IonLabel>{SETTINGS_COPY.background}</IonLabel>
      </IonListHeader>
      <IonList inset>
        <IonItem button detail={false} onClick={() => fileInput.current?.click()}>
          <IonIcon slot="start" color="primary" icon={imageOutline} />
          <IonLabel>{SETTINGS_COPY.backgroundPhoto}</IonLabel>
        </IonItem>
        {background && (
          <IonItem button detail={false} onClick={() => void clearBackground()}>
            <IonIcon slot="start" color="danger" icon={trashOutline} />
            <IonLabel color="danger">{SETTINGS_COPY.removeBackgroundPhoto}</IonLabel>
          </IonItem>
        )}
      </IonList>
      <IonNote className="list-footer">{SETTINGS_COPY.backgroundFooter}</IonNote>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        hidden
        aria-label={SETTINGS_COPY.backgroundPhotoFile}
        onChange={(event) => void choose(event)}
      />
    </>
  )
}
