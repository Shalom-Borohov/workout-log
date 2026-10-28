import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react'
import { useMemo, useState } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { ROUTINES_COPY } from './copy'
import { saveRoutine } from '../../data/repo'
import { parseNote } from '../../domain/parseNote'
import { exercisesOf } from '../../domain/progress'
import { ROUTINES_PATH, routinePath } from '../../navigation/paths'
import { NotePreview } from './NotePreview'
import './routines.css'

const newId = () => crypto.randomUUID()

export function ImportNotePage() {
  const router = useIonRouter()
  const [text, setText] = useState('')
  const parsed = useMemo(() => parseNote(text, newId), [text])

  const missingReps = exercisesOf(parsed).some(
    (exercise) => exercise.target.kind === 'reps' && exercise.target.reps === 0,
  )

  async function save() {
    const id = newId()

    await saveRoutine({ id, name: parsed.name, sections: parsed.sections, updatedAt: Date.now() })
    router.push(routinePath(id), 'forward', 'replace')
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTINES_PATH} text={COMMON_COPY.back} />
          </IonButtons>
          <IonTitle>{COMMON_COPY.pasteNote}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong disabled={parsed.sections.length === 0} onClick={save}>
              {COMMON_COPY.save}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          <IonItem>
            <IonTextarea
              aria-label={ROUTINES_COPY.note}
              autoGrow
              rows={8}
              placeholder={ROUTINES_COPY.notePlaceholder}
              value={text}
              onIonInput={(event) => typeof event.detail.value === 'string' && setText(event.detail.value)}
            />
          </IonItem>
        </IonList>
        <IonNote className="list-footer">{ROUTINES_COPY.noteSyntaxHint}</IonNote>
        {parsed.sections.length > 0 && (
          <>
            <IonListHeader>
              <IonLabel>{COMMON_COPY.routineName}</IonLabel>
            </IonListHeader>
            <IonList inset>
              <IonItem>
                <IonLabel>{parsed.name}</IonLabel>
              </IonItem>
            </IonList>
            <IonNote className="list-footer">
              {missingReps ? ROUTINES_COPY.missingRepsHint : ROUTINES_COPY.checkResultHint}
            </IonNote>
            <NotePreview sections={parsed.sections} />
          </>
        )}
      </IonContent>
    </IonPage>
  )
}
