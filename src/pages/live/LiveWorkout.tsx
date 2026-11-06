import { IonContent, useIonRouter } from '@ionic/react'
import { useRef, useState } from 'react'
import { LIVE_COPY } from './copy'
import { useBackgroundUrl } from '../../data/hooks'
import { deleteWorkout } from '../../data/repo'
import type { Workout } from '../../domain/types'
import { addSet, currentIndex, duplicateSetAt, removeSetAt, setNotes, workoutProgress } from '../../domain/workoutEdits'
import { TIMELINE_PATH, type WorkoutHostPath, workoutDetailPath } from '../../navigation/paths'
import { BackToCurrent } from './BackToCurrent'
import { FinishSheet, type SheetMode } from './FinishSheet'
import { ItemActions } from './ItemActions'
import { ItemCard } from './ItemCard'
import { ItemListModal, type ListMode } from './ItemListModal'
import { LiveFooter } from './LiveFooter'
import { LiveHeader } from './LiveHeader'
import { NoteSheet } from './NoteSheet'
import { RoutineActions } from './RoutineActions'
import { useItemMenu } from './useItemMenu'
import { useLiveWorkout } from './useLiveWorkout'
import { useOverviewEditor } from './useOverviewEditor'
import { useSetSelection } from './useSetSelection'
import { useItemSwipe } from './useSwipe'
import { ItemEditorSheets } from '../../components/itemEditor/ItemEditorSheets'
import { useSave } from '../../hooks/useSave'
import { useWakeLock } from '../../hooks/useWakeLock'
import './live.css'
import './photo.css'

export function LiveWorkout({ initial, tab }: { initial: Workout; tab: WorkoutHostPath }) {
  const router = useIonRouter()
  const { save } = useSave()

  const {
    workout,
    index,
    travel,
    total,
    ref,
    item,
    active,
    previous,
    restTimer,
    apply,
    move,
    step,
    changeSet,
    toggleItemSkip,
    finish,
  } = useLiveWorkout(initial)

  const [sheet, setSheet] = useState<SheetMode | null>(null)
  const [listing, setListing] = useState<ListMode | null>(null)
  const [noting, setNoting] = useState(false)
  const content = useRef<HTMLIonContentElement>(null)
  const photo = useBackgroundUrl()
  const backTo = currentIndex(workout)
  const openNote = () => setNoting(true)

  useWakeLock(active)
  useItemSwipe(content, step)

  const selection = useSetSelection(item, {
    onChange: changeSet,
    onDuplicate: (exercise, set) => apply((current) => duplicateSetAt(current, ref, exercise, set)),
    onRemove: (exercise, set) => apply((current) => removeSetAt(current, ref, exercise, set)),
  })

  const editor = useOverviewEditor(workout, previous, apply)

  const openMenu = useItemMenu({
    item,
    selection,
    onAddAfter: () => editor.flow.addAfter(item.id),
    onSummary: () => setSheet('summary'),
    onEditWorkout: () => setListing('editing'),
  })

  async function saveSheet(summary: string) {
    if (sheet === 'summary') {
      setSheet(null)
      apply((current) => ({ ...current, summary }))

      return
    }

    if (await save(() => finish(summary))) {
      setSheet(null)
      router.push(workoutDetailPath(tab, workout.id), 'root', 'replace')
    }
  }

  async function remove() {
    setSheet(null)

    if (await save(() => deleteWorkout(workout.id))) {
      router.push(TIMELINE_PATH, 'root', 'replace')
    }
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
          selection={selection}
          onNote={openNote}
        >
          <ItemActions
            item={item}
            onToggleSkip={toggleItemSkip}
            onAddSet={() => apply((current) => addSet(current, ref))}
          />
        </ItemCard>
        {active && backTo !== null && backTo !== index && <BackToCurrent onBack={() => move(backTo)} />}
      </IonContent>
      <LiveFooter index={index} total={total} onMove={move} onList={() => setListing('progress')} />
      <ItemListModal
        mode={listing}
        workout={workout}
        current={index}
        editor={editor}
        onEdit={apply}
        onSelect={(next) => {
          move(next)
          setListing(null)
        }}
        onModeChange={setListing}
      />
      <ItemEditorSheets
        flow={editor.flow}
        editing={editor.editing}
        showStartWeight={false}
        onChange={editor.change}
        onDelete={editor.remove}
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
        onSave={saveSheet}
        onDelete={remove}
      >
        <RoutineActions workout={workout} onEdit={apply} unsavedOnly />
      </FinishSheet>
    </>
  )
}
