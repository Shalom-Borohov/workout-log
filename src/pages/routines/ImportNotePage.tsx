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
import { saveRoutine } from '../../data/repo'
import { parseNote } from '../../domain/parseNote'
import { exercisesOf } from '../../domain/progress'
import { NotePreview } from './NotePreview'
import './routines.css'

const newId = () => crypto.randomUUID()

const PLACEHOLDER = `הדביקו כאן את הפתק, למשל:
אימון רגליים
חימום 2 סטים:
אופניים 5 דקות

עיקרי 3 סטים:
סקוואט 12 -> מתח 8`

export function ImportNotePage() {
  const router = useIonRouter()
  const [text, setText] = useState('')
  const parsed = useMemo(() => parseNote(text, newId), [text])
  const missingReps = exercisesOf(parsed).some((e) => e.target.kind === 'reps' && e.target.reps === 0)

  async function save() {
    const id = newId()

    await saveRoutine({ id, name: parsed.name, sections: parsed.sections, updatedAt: Date.now() })
    router.push(`/tabs/routines/${id}`, 'forward', 'replace')
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/routines" text="חזרה" />
          </IonButtons>
          <IonTitle>הדבקת פתק</IonTitle>
          <IonButtons slot="end">
            <IonButton strong disabled={parsed.sections.length === 0} onClick={save}>
              שמירה
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          <IonItem>
            <IonTextarea
              aria-label="פתק"
              autoGrow
              rows={8}
              placeholder={PLACEHOLDER}
              value={text}
              onIonInput={(e) => typeof e.detail.value === 'string' && setText(e.detail.value)}
            />
          </IonItem>
        </IonList>
        <IonNote className="list-footer">שורה שמסתיימת ב״סטים:״ פותחת חלק, ו־{'->'} מחבר שני תרגילים לזוג.</IonNote>
        {parsed.sections.length > 0 && (
          <>
            <IonListHeader>
              <IonLabel>שם האימון</IonLabel>
            </IonListHeader>
            <IonList inset>
              <IonItem>
                <IonLabel>{parsed.name}</IonLabel>
              </IonItem>
            </IonList>
            <IonNote className="list-footer">
              {missingReps
                ? 'תרגיל עם ? חסר בו מספר חזרות. אפשר לתקן אחרי השמירה.'
                : 'בדקו את התוצאה. אפשר לתקן אחרי השמירה.'}
            </IonNote>
            <NotePreview sections={parsed.sections} />
          </>
        )}
      </IonContent>
    </IonPage>
  )
}
