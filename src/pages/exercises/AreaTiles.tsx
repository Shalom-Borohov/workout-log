import { BodyAreaIcon } from '../../components/bodyArea/BodyAreaIcon'
import { BODY_AREA_COPY } from '../../copy/bodyAreas'
import { COMMON_COPY } from '../../copy/common'
import { areaKey, type AreaGroup } from '../../domain/bodyAreas'
import { countLabel } from '../../domain/format'
import { ActivityIcon } from './ActivityIcon'
import { AreaTile } from './AreaTile'
import { EXERCISES_COPY } from './copy'
import { ACTIVITIES_TILE, type TileKey } from './tileKeys'
import './areaTiles.css'

interface Props {
  groups: AreaGroup[]
  activityCount: number
  selected?: TileKey
  onSelect: (key: TileKey) => void
}

export function AreaTiles({ groups, activityCount, selected, onSelect }: Props) {
  return (
    <div
      className="area-tiles"
      role="group"
      aria-label={activityCount > 0 ? EXERCISES_COPY.areasAndActivities : BODY_AREA_COPY.label}
    >
      {groups.map((group) => {
        const key = areaKey(group.area)
        const name = BODY_AREA_COPY.name(group.area)
        const count = group.names.length

        return (
          <AreaTile
            key={key}
            icon={<BodyAreaIcon area={group.area} />}
            name={name}
            count={count}
            label={EXERCISES_COPY.areaTile(name, countLabel(count, EXERCISES_COPY.oneExercise, COMMON_COPY.exercises))}
            isSelected={key === selected}
            onSelect={() => onSelect(key)}
          />
        )
      })}
      {activityCount > 0 && (
        <AreaTile
          icon={<ActivityIcon />}
          name={EXERCISES_COPY.activities}
          count={activityCount}
          label={EXERCISES_COPY.activitiesTile(activityCount)}
          isSelected={selected === ACTIVITIES_TILE}
          onSelect={() => onSelect(ACTIVITIES_TILE)}
        />
      )}
    </div>
  )
}
