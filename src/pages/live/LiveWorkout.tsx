import { IonContent, useIonRouter } from '@ionic/react'
import { useMemo, useRef, useState } from 'react'
import { useFinishedWorkouts } from '../../data/hooks'
import { deleteWorkout, saveWorkout } from '../../data/repo'
import { previousSetsLookup } from '../../domain/progress'
import type { SetLog, Workout } from '../../domain/types'
import { FinishSheet } from './FinishSheet'
import { ItemCard } from './ItemCard'
import { ItemListModal } from './ItemListModal'
import { LiveFooter } from './LiveFooter'
import { LiveHeader } from './LiveHeader'
import { useAutoAdvance } from './useAutoAdvance'
import { useItemMenu } from './useItemMenu'
import { useWakeLock } from './useWakeLock'
import {
  addSet,
  firstUnfinished,
  isDone,
  itemAt,
  itemRefs,
  removeSet,
  toggleSkip,
  updateSet,
  workoutProgress,
} from '../../domain/workoutEdits'
import './live.css'

export function LiveWorkout({ initial }: { initial: Workout }) {
  const router = useIonRouter()
  const [workout, setWorkout] = useState(initial)
  const latest = useRef(initial)
  const [index, setIndex] = useState(() => firstUnfinished(initial))
  const [finishing, setFinishing] = useState(false)
  const [listing, setListing] = useState(false)
  const refs = itemRefs(workout)
  const ref = refs[index]
  const item = itemAt(workout, ref)
  const active = workout.finishedAt === null
  const advance = useAutoAdvance(setIndex)
  const history = useFinishedWorkouts()

  const previous = useMemo(
    () => history && previousSetsLookup(history, workout.startedAt),
    [history, workout.startedAt],
  )

  useWakeLock(active)

  function apply(edit: (w: Workout) => Workout) {
    const next = edit(latest.current)

    advance.cancel()
    latest.current = next
    setWorkout(next)
    void saveWorkout(next)
  }

  function move(next: number) {
    advance.cancel()
    setIndex(next)
  }

  function changeSet(exercise: number, set: number, patch: Partial<SetLog>) {
    apply((w) => updateSet(w, ref, exercise, set, patch))
    if (patch.done === true && active && index < refs.length - 1 && isDone(itemAt(latest.current, ref))) {
      advance.schedule(index + 1)
    }
  }

  const openMenu = useItemMenu(item, {
    onToggleSkip: () => apply((w) => toggleSkip(w, ref)),
    onAddSet: () => apply((w) => addSet(w, ref)),
    onRemoveSet: () => apply((w) => removeSet(w, ref)),
  })

  async function save(summary: string) {
    setFinishing(false)
    await saveWorkout({ ...latest.current, summary, finishedAt: Date.now() })
    router.push(`/tabs/timeline/${workout.id}`, 'root', 'replace')
  }

  async function remove() {
    setFinishing(false)
    await deleteWorkout(workout.id)
    router.push('/tabs/timeline', 'root', 'replace')
  }

  return (
    <>
      <LiveHeader
        title={active ? workout.routineName : 'עריכת אימון'}
        startedAt={active ? workout.startedAt : null}
        progress={workoutProgress(workout)}
        onMenu={openMenu}
        onFinish={() => (active ? setFinishing(true) : router.goBack())}
      />
      <IonContent>
        <ItemCard
          key={index}
          item={item}
          sectionName={workout.sections[ref.section].name}
          position={index + 1}
          total={refs.length}
          previous={previous}
          onSetChange={changeSet}
        />
      </IonContent>
      <LiveFooter index={index} total={refs.length} onMove={move} onList={() => setListing(true)} />
      <ItemListModal
        isOpen={listing}
        workout={workout}
        current={index}
        onSelect={(next) => {
          move(next)
          setListing(false)
        }}
        onClose={() => setListing(false)}
      />
      <FinishSheet
        isOpen={finishing}
        initialSummary={workout.summary}
        onCancel={() => setFinishing(false)}
        onSave={save}
        onDelete={remove}
      />
    </>
  )
}
