import { LIVE_COPY } from './copy'
import { amountUnit, toDisplayAmount } from '../../domain/format'
import { weightText } from '../../domain/numberInput'
import type { SetLog, Target } from '../../domain/types'
import { SetCheck } from '../../components/SetCheck'
import { numeralChars } from './numeral'
import './tile.css'

function TileValue({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="tile-number">
      <span className={value === '' ? 'tile-numeral tile-numeral-empty' : 'tile-numeral'} data-chars={numeralChars(value)}>
        {value === '' ? LIVE_COPY.noValue : value}
      </span>
      <span className="tile-unit">{unit}</span>
    </div>
  )
}

interface WaitingTileProps {
  name: string
  selectLabel: string
  label: string
  target: Target
  set: SetLog
  onSelect: () => void
  onToggle: () => void
}

export function WaitingTile({ name, selectLabel, label, target, set, onSelect, onToggle }: WaitingTileProps) {
  return (
    <section className="waiting-set tile tile-quiet tile-pair">
      <button type="button" className="plain-button tile-cover" aria-label={selectLabel} onClick={onSelect} />
      <h2 className="tile-name">{name}</h2>
      <div className="tile-numbers">
        {target.kind === 'reps' && (
          <>
            <TileValue value={weightText(set.weight)} unit={LIVE_COPY.kg} />
            <span className="tile-times" aria-hidden="true">
              {LIVE_COPY.times}
            </span>
          </>
        )}
        <TileValue value={String(toDisplayAmount(set.amount, target))} unit={amountUnit(target)} />
      </div>
      <SetCheck label={label} done={set.done} size="large" onToggle={onToggle} />
    </section>
  )
}
