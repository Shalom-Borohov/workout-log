import { BodyAreaIcon } from '../../components/bodyArea/BodyAreaIcon'
import { BODY_AREA_COPY } from '../../copy/bodyAreas'
import { COMMON_COPY } from '../../copy/common'
import { areaKey, type AreaGroup } from '../../domain/bodyAreas'
import { countLabel } from '../../domain/format'
import { EXERCISES_COPY } from './copy'
import './areaTiles.css'

interface Props {
  groups: AreaGroup[]
  selected: AreaGroup
  onSelect: (group: AreaGroup) => void
}

export function AreaTiles({ groups, selected, onSelect }: Props) {
  return (
    <div className="area-tiles" role="group" aria-label={BODY_AREA_COPY.label}>
      {groups.map((group) => {
        const isSelected = areaKey(group.area) === areaKey(selected.area)
        const name = BODY_AREA_COPY.name(group.area)
        const count = group.names.length

        return (
          <button
            key={areaKey(group.area)}
            type="button"
            className={`area-tile ${isSelected ? 'tile-accent' : 'tile-quiet'}`}
            aria-pressed={isSelected}
            aria-label={EXERCISES_COPY.areaTile(
              name,
              countLabel(count, EXERCISES_COPY.oneExercise, COMMON_COPY.exercises),
            )}
            onClick={() => onSelect(group)}
          >
            <BodyAreaIcon area={group.area} />
            <span className="area-tile-name">{name}</span>
            <span className="area-tile-count">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
