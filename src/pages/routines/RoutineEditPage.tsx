import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/react'
import { addCircle } from 'ionicons/icons'
import { useParams } from 'react-router-dom'
import { commitName } from '../../components/commitName'
import { COMMON_COPY } from '../../copy/common'
import { ROUTINES_COPY } from './copy'
import { useRoutine } from '../../data/hooks'
import { setRoutineDaily, updateRoutine } from '../../data/repo'
import { type Change, newSection, removeSection, updateSection } from '../../domain/routineEdit'
import type { Routine } from '../../domain/types'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { useSave } from '../../hooks/useSave'
import type { RoutineHostPath } from '../../navigation/paths'
import { ItemEditorSheets } from '../../components/itemEditor/ItemEditorSheets'
import { DrillColorPicker } from './DrillColorPicker'
import { RoutineEditActions } from './RoutineEditActions'
import { SectionEditor } from './SectionEditor'
import { useRoutineItemEditor } from './useRoutineItemEditor'
import './routines.css'

function RoutineEditor({ routine, tab }: { routine: Routine; tab: RoutineHostPath }) {
  const confirmDelete = useConfirmDelete()
  const { save } = useSave()
  const edit = (change: Change<Routine>) => void save(() => updateRoutine(routine.id, change))
  const items = useRoutineItemEditor(routine, edit)

  function addSection() {
    const section = newSection(crypto.randomUUID(), ROUTINES_COPY.newSection)

    edit((current) => ({ ...current, sections: [...current.sections, section] }))
  }

  function rename(name: string) {
    edit((current) => ({ ...current, name }))
  }

  return (
    <>
      <IonList inset>
        <IonItem>
          <IonInput
            label={COMMON_COPY.routineName}
            labelPlacement="stacked"
            placeholder={COMMON_COPY.routineName}
            value={routine.name}
            onIonChange={(event) => commitName(event, routine.name, rename)}
          />
        </IonItem>
        <IonItem>
          <IonToggle
            checked={routine.daily}
            onIonChange={(event) => void save(() => setRoutineDaily(routine.id, event.detail.checked))}
          >
            {ROUTINES_COPY.dailyToggle}
          </IonToggle>
        </IonItem>
        {routine.daily && (
          <IonItem>
            <DrillColorPicker value={routine.color} onChange={(color) => edit((current) => ({ ...current, color }))} />
          </IonItem>
        )}
      </IonList>
      <IonNote className="list-footer">{ROUTINES_COPY.dailyHint}</IonNote>
      {routine.sections.map((section) => (
        <SectionEditor
          key={section.id}
          section={section}
          onChange={(change) => edit((current) => updateSection(current, section.id, change))}
          onEditItem={items.flow.open}
          onDeleteItem={items.remove}
          onAddItem={() => items.flow.addTo(section.id)}
          onDelete={() =>
            confirmDelete({
              header: ROUTINES_COPY.deleteSectionQuestion,
              message: section.name,
              onConfirm: () => edit((current) => removeSection(current, section.id)),
            })
          }
        />
      ))}
      <IonList inset>
        <IonItem button detail={false} onClick={addSection}>
          <IonIcon slot="start" color="primary" icon={addCircle} aria-hidden="true" />
          <IonLabel color="primary">{ROUTINES_COPY.addSection}</IonLabel>
        </IonItem>
      </IonList>
      <RoutineEditActions routine={routine} tab={tab} />
      <ItemEditorSheets flow={items.flow} editing={items.editing} onChange={items.change} onDelete={items.remove} />
    </>
  )
}

function RoutineEditView({ id, tab }: { id: string; tab: RoutineHostPath }) {
  const routine = useRoutine(id)

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={tab} text={COMMON_COPY.back} />
          </IonButtons>
          <IonTitle>{routine ? routine.name : ROUTINES_COPY.editRoutine}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>{routine && <RoutineEditor routine={routine} tab={tab} />}</IonContent>
    </>
  )
}

export function RoutineEditPage({ tab }: { tab: RoutineHostPath }) {
  const { id } = useParams()

  return <IonPage>{id && <RoutineEditView id={id} tab={tab} />}</IonPage>
}
