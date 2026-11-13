import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  name: string
  count: number
  label: string
  isSelected: boolean
  onSelect: () => void
}

export function AreaCell({ icon, name, count, label, isSelected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`plain-button area-cell ${isSelected ? 'plate-accent area-cell-selected' : 'plate'}`}
      aria-pressed={isSelected}
      aria-label={label}
      onClick={onSelect}
    >
      <span className="area-cell-icon">
        {icon}
        <span className="area-cell-count">{count}</span>
      </span>
      <span className="area-cell-name">{name}</span>
    </button>
  )
}
