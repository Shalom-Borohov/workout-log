import { IonContent, useIonRouter } from '@ionic/react'
import { useRef, useState } from 'react'
import { LIVE_COPY } from './copy'
import { useBackgroundUrl } from '../../data/hooks'
import { deleteWorkout } from '../../data/repo'
import type { Workout } from '../../domain/types'
import { addSet, currentIndex, duplicateSetAt, removeSetAt, setNotes, toggleSkip, workoutProgress } from '../../domain/workoutEdits'
import { TIMELINE_PATH, type WorkoutHostPath, workoutDetailPath } from '../../navigation/paths'
import { BackToCurrent } from './BackToCurrent'
import { FinishSheet, type SheetMode } from './FinishSheet'
import { ItemActions } from './ItemActions'
import { ItemCard } from './ItemCard'
import { ItemListModal } from './ItemListModal'
import { LiveFooter } from './LiveFooter'
import { LiveHeader } from './LiveHeader'
import { NoteSheet } from './NoteSheet'
import { useItemMenu } from './useItemMenu'
import { useLiveWorkout } from './useLiveWorkout'
import { useItemSwipe } from './useSwipe'
import { useWakeLock } from './useWakeLock'
import './live.css'
import './photo.css'

export function LiveWorkout({ initial, tab }: { initial: Workout; tab: WorkoutHostPath }) {
  const router = useIonRouter()

  const { workout, index, travel, total, ref, item, active, previous, restTimer, apply, move, step, changeSet, finish } =
    useLiveWorkout(initial)

  const [sheet, setSheet] = useState<SheetMode | null>(null)
  const [listing, setListing] = useState(false)
  const [noting, setNoting] = useState(false)
  const content = useRef<HTMLIonContentElement>(null)
  const photo = useBackgroundUrl()
  const backTo = currentIndex(workout)
  const openNote = () => setNoting(true)

  useWakeLock(active)
  useItemSwipe(content, step)

  const openMenu = useItemMenu(item, () => setSheet('summary'))

  async function save(summary: string) {
    setSheet(null)

    if (sheet === 'summary') {
      apply((current) => ({ ...current, summary }))

      return
    }
    await finish(summary)
    router.push(workoutDetailPath(tab, workout.id), 'root', 'replace')
  }

  async function remove() {
    setSheet(null)
    await deleteWorkout(workout.id)
    router.push(TIMELINE_PATH, 'root', 'replace')
  }

  function leave() {
    if (active) {
      setSheet('finish')
    } else if (router.canGoBack()) {
      router.goBack()
    } else {
      router.push(workoutDetailPath(tab, workout.id), 'back', 'replace')
    }
  }

  return (
    <>
      <LiveHeader
        title={active ? workout.routineName : LIVE_COPY.editWorkout}
        startedAt={active ? workout.startedAt : null}
        progress={workoutProgress(workout)}
        restTimer={restTimer}
        onMenu={openMenu}
        onFinish={leave}
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
          onSetChange={changeSet}
          onSetDuplicate={(exercise, set) => apply((current) => duplicateSetAt(current, ref, exercise, set))}
          onSetRemove={(exercise, set) => apply((current) => removeSetAt(current, ref, exercise, set))}
          onNote={openNote}
        >
          <ItemActions
            item={item}
            onToggleSkip={() => apply((current) => toggleSkip(current, ref))}
            onAddSet={() => apply((current) => addSet(current, ref))}
          />
        </ItemCard>
        {active && backTo !== null && backTo !== index && <BackToCurrent onBack={() => move(backTo)} />}
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
      <NoteSheet
        isOpen={noting}
        item={item}
        onCancel={() => setNoting(false)}
        onSave={(notes) => {
          apply((current) => setNotes(current, ref, notes))
          setNoting(false)
        }}
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
