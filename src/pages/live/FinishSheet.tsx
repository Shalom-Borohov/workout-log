import { IonContent, IonItem, IonList, IonModal, IonTextarea } from '@ionic/react'
import { type ReactNode, useState } from 'react'
import { DurationMinutesItem } from '../../components/DurationMinutesItem'
import { FULL_SHEET } from '../../components/sheet'
import { COMMON_COPY } from '../../copy/common'
import { finishMinutes, isClockPastLimit, MAX_DURATION_MINUTES } from '../../domain/pastTime'
import { MINUTE_MS } from '../../domain/time'
import { LIVE_COPY } from './copy'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { useNow } from '../../hooks/useNow'
import { SheetHeader } from './SheetHeader'

export type SheetMode = 'finish' | 'summary'

type FinishFormProps = {
  mode: SheetMode
  initialSummary: string
  startedAt: number
  onCancel: () => void
  onSave: (summary: string, minutes: number | null) => void
  onDelete: () => void
  children?: ReactNode
}

function DeleteRow({ onDelete }: { onDelete: () => void }) {
  const confirmDelete = useConfirmDelete()

  return (
    <IonList inset>
      <IonItem
        button
        detail={false}
        onClick={() =>
          confirmDelete({
            header: COMMON_COPY.deleteWorkoutQuestion,
            message: LIVE_COPY.deleteWorkoutMessage,
            onConfirm: onDelete,
          })
        }
      >
        <span className="finish-delete">{COMMON_COPY.deleteWorkout}</span>
      </IonItem>
    </IonList>
  )
}

function FinishForm({ mode, initialSummary, startedAt, onCancel, onSave, onDelete, children }: FinishFormProps) {
  const [summary, setSummary] = useState(initialSummary)
  const [duration, setDuration] = useState(String(MAX_DURATION_MINUTES))
  const now = useNow(MINUTE_MS)
  const showDuration = mode === 'finish' && isClockPastLimit(startedAt, now)

  return (
    <>
      <SheetHeader
        title={mode === 'finish' ? COMMON_COPY.workoutSummary : COMMON_COPY.summary}
        onCancel={onCancel}
        onSave={() => onSave(summary.trim(), showDuration ? finishMinutes(duration) : null)}
      />
      <IonContent>
        <IonList inset>
          <IonItem>
            <IonTextarea
              aria-label={COMMON_COPY.workoutSummary}
              placeholder={LIVE_COPY.summaryPlaceholder}
              autoGrow
              rows={3}
              value={summary}
              onIonInput={(event) => typeof event.detail.value === 'string' && setSummary(event.detail.value)}
            />
          </IonItem>
          {showDuration && <DurationMinutesItem value={duration} onChange={setDuration} />}
        </IonList>
        {mode === 'finish' && children}
        {mode === 'finish' && <DeleteRow onDelete={onDelete} />}
      </IonContent>
    </>
  )
}

type FinishSheetProps = Omit<FinishFormProps, 'mode'> & { mode: SheetMode | null }

export function FinishSheet({ mode, ...form }: FinishSheetProps) {
  const [shown, setShown] = useState<SheetMode>('finish')

  if (mode !== null && mode !== shown) {
    setShown(mode)
  }

  return (
    <IonModal isOpen={mode !== null} onDidDismiss={form.onCancel} {...FULL_SHEET}>
      <FinishForm mode={shown} {...form} />
    </IonModal>
  )
}
