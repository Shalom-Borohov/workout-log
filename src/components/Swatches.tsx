import { useId, type CSSProperties } from 'react'
import { COMMON_COPY } from '../copy/common'
import './swatches.css'

export function Swatches<T extends keyof typeof COMMON_COPY.colorNames>({
  options,
  columns,
  value,
  swatchStyle,
  onChange,
}: {
  options: readonly T[]
  columns: number
  value: T | null
  swatchStyle: (option: T) => CSSProperties
  onChange: (option: T) => void
}) {
  const name = `swatch-${useId()}`

  return (
    <div className="swatch-options" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map((option) => (
        <label key={option} className="swatch-option">
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            aria-label={COMMON_COPY.colorNames[option]}
            onChange={() => onChange(option)}
          />
          <span style={swatchStyle(option)} />
        </label>
      ))}
    </div>
  )
}
