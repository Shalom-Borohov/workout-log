import { IonButton, IonIcon, IonItemOption, IonItemOptions, IonItemSliding, IonReorder } from '@ionic/react'
import { removeCircle } from 'ionicons/icons'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { ButtonRow } from '../ButtonRow'
import { ITEM_EDITOR_COPY } from './copy'
import { useRevealedDelete } from './useRevealedDelete'

interface Props {
  title: string
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
  children: ReactNode
}

export function EditableItemRow({ title, canDelete, onEdit, onDelete, children }: Props) {
  const sliding = useRef<HTMLIonItemSlidingElement>(null)
  const { revealed, toggle, hide } = useRevealedDelete(sliding)

  function remove() {
    void sliding.current?.close()
    onDelete()
  }

  function tapRow() {
    if (revealed) {
      hide()

      return
    }

    onEdit()
  }

  return (
    <IonItemSliding ref={sliding} disabled={!canDelete} onIonDrag={hide}>
      <ButtonRow
        label={title}
        onClick={tapRow}
        controls={
          <>
            {canDelete && (
              <IonButton
                slot="start"
                fill="clear"
                aria-label={ITEM_EDITOR_COPY.revealDelete(title)}
                aria-expanded={revealed ? 'true' : 'false'}
                onClick={(event) => {
                  event.stopPropagation()
                  void sliding.current?.closeOpened()
                  toggle()
                }}
              >
                <IonIcon slot="icon-only" color="danger" icon={removeCircle} aria-hidden="true" />
              </IonButton>
            )}
            {revealed && canDelete ? (
              <IonButton
                slot="end"
                color="danger"
                fill="solid"
                aria-label={ITEM_EDITOR_COPY.deleteItem(title)}
                onClick={(event) => {
                  event.stopPropagation()
                  hide()
                  remove()
                }}
              >
                {COMMON_COPY.delete}
              </IonButton>
            ) : (
              <IonReorder slot="end" />
            )}
          </>
        }
      >
        {children}
      </ButtonRow>
      <IonItemOptions side="end">
        <IonItemOption color="danger" aria-label={ITEM_EDITOR_COPY.deleteItem(title)} onClick={remove}>
          {COMMON_COPY.delete}
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  )
}
