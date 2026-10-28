import { IonContent, useIonRouter } from '@ionic/react'
import { useRef, useState } from 'react'
import { LIVE_COPY } from './copy'
import { useBackgroundUrl } from '../../data/hooks'
import { deleteWorkout } from '../../data/repo'
import type { Workout } from '../../domain/types'
import { addSet, removeSet, setNotes, toggleSkip, workoutProgress } from '../../domain/workoutEdits'
import { TIMELINE_PATH, workoutDetailPath } from '../../navigation/paths'
import { FinishSheet, type SheetMode } from './FinishSheet'
import { ItemCard } from './ItemCard'
import { ItemListModal } from './ItemListModal'
import { LiveFooter } from './LiveFooter'
import { LiveHeader } from './LiveHeader'
import { useItemMenu } from './useItemMenu'
import { useLiveWorkout } from './useLiveWorkout'
import { useNoteAlert } from './useNoteAlert'
import { useItemSwipe } from './useSwipe'
import { useWakeLock } from './useWakeLock'
import './live.css'
import './photo.css'

export function LiveWorkout({ initial }: { initial: Workout }) {
  const router = useIonRouter()

  const { workout, index, travel, total, ref, item, active, previous, apply, move, step, changeSet, finish } =
    useLiveWorkout(initial)

  const [sheet, setSheet] = useState<SheetMode | null>(null)
  const [listing, setListing] = useState(false)
  const content = useRef<HTMLIonContentElement>(null)
  const photo = useBackgroundUrl()

  useWakeLock(active)
  useItemSwipe(content, step)

  const openNote = useNoteAlert(item, (notes) => apply((current) => setNotes(current, ref, notes)))

  const openMenu = useItemMenu(item, {
    onToggleSkip: () => apply((current) => toggleSkip(current, ref)),
    onAddSet: () => apply((current) => addSet(current, ref)),
    onRemoveSet: () => apply((current) => removeSet(current, ref)),
    onNote: () => void openNote(),
    onSummary: () => setSheet('summary'),
  })

  async function save(summary: string) {
    setSheet(null)

    if (sheet === 'summary') {
      apply((current) => ({ ...current, summary }))

      return
    }
    await finish(summary)
    router.push(workoutDetailPath(workout.id), 'root', 'replace')
  }

  async function remove() {
    setSheet(null)
    await deleteWorkout(workout.id)
    router.push(TIMELINE_PATH, 'root', 'replace')
  }

  return (
    <>
      <LiveHeader
        title={active ? workout.routineName : LIVE_COPY.editWorkout}
        startedAt={active ? workout.startedAt : null}
        progress={workoutProgress(workout)}
        onMenu={openMenu}
        onFinish={() => (active ? setSheet('finish') : router.goBack())}
      />
      <IonContent
        ref={content}
        className={photo ? 'live-content live-photo' : 'live-content'}
        style={photo ? { backgroundImage: `url("${photo}")` } : undefined}
      >
        <ItemCard
          key={item.id}
          travel={travel}
          item={item}
          sectionName={workout.sections[ref.section].name}
          position={index + 1}
          total={total}
          previous={previous}
          onSetChange={changeSet}
        />
      </IonContent>
      <LiveFooter index={index} total={total} onMove={move} onList={() => setListing(true)} />
      <ItemListModal
        isOpen={listing}
        workout={workout}
        current={index}
        previous={previous}
        onEdit={apply}
        onSelect={(next) => {
          move(next)
          setListing(false)
        }}
        onClose={() => setListing(false)}
      />
      <FinishSheet
        mode={sheet}
        initialSummary={workout.summary}
        onCancel={() => setSheet(null)}
        onSave={save}
        onDelete={remove}
      />
    </>
  )
}
