import { IonContent, IonItem, IonList, IonModal, IonTextarea } from '@ionic/react'
import { useState } from 'react'
import { FULL_SHEET } from '../../components/sheet'
import { LIVE_COPY } from './copy'
import type { WorkoutItem } from '../../domain/types'
import { SheetHeader } from './SheetHeader'

interface NoteFormProps {
  item: WorkoutItem
  onCancel: () => void
  onSave: (notes: string[]) => void
}

function NoteForm({ item, onCancel, onSave }: NoteFormProps) {
  const [notes, setNotes] = useState(() => item.exercises.map((exercise) => exercise.note))
  const pair = item.exercises.length > 1

  return (
    <>
      <SheetHeader title={LIVE_COPY.noteTitle} onCancel={onCancel} onSave={() => onSave(notes.map((note) => note.trim()))} />
      <IonContent>
        <IonList inset>
          {item.exercises.map((exercise, exerciseIndex) => (
            <IonItem key={exerciseIndex}>
              <IonTextarea
                aria-label={LIVE_COPY.noteFor(exercise.name)}
                placeholder={pair ? exercise.name : LIVE_COPY.notePlaceholder}
                autoGrow
                rows={4}
                value={notes[exerciseIndex]}
                onIonInput={(event) => {
                  const { value } = event.detail

                  if (typeof value === 'string') {
                    setNotes((current) => current.map((note, noteIndex) => (noteIndex === exerciseIndex ? value : note)))
                  }
                }}
              />
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </>
  )
}

type NoteSheetProps = NoteFormProps & { isOpen: boolean }

export function NoteSheet({ isOpen, ...form }: NoteSheetProps) {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={form.onCancel} {...FULL_SHEET}>
      <NoteForm {...form} />
    </IonModal>
  )
}
