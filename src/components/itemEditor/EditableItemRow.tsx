import { IonButton, IonIcon, IonItemOption, IonItemOptions, IonItemSliding, IonReorder } from '@ionic/react'
import { removeCircle } from 'ionicons/icons'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { ButtonRow } from '../ButtonRow'
import { ITEM_EDITOR_COPY } from './copy'

interface Props {
  title: string
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
  children: ReactNode
}

export function EditableItemRow({ title, canDelete, onEdit, onDelete, children }: Props) {
  const sliding = useRef<HTMLIonItemSlidingElement>(null)

  function remove() {
    void sliding.current?.close()
    onDelete()
  }

  return (
    <IonItemSliding ref={sliding} disabled={!canDelete}>
      <ButtonRow
        label={title}
        onClick={onEdit}
        controls={
          <>
            {canDelete && (
              <IonButton
                slot="start"
                fill="clear"
                aria-label={ITEM_EDITOR_COPY.revealDelete(title)}
                onClick={(event) => {
                  event.stopPropagation()
                  void sliding.current?.open('end')
                }}
              >
                <IonIcon slot="icon-only" color="danger" icon={removeCircle} aria-hidden="true" />
              </IonButton>
            )}
            <IonReorder slot="end" />
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
