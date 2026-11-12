import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  name: string
  count: number
  label: string
  isSelected: boolean
  onSelect: () => void
}

export function AreaTile({ icon, name, count, label, isSelected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`area-tile ${isSelected ? 'tile-accent' : 'tile-quiet'}`}
      aria-pressed={isSelected}
      aria-label={label}
      onClick={onSelect}
    >
      {icon}
      <span className="area-tile-name">{name}</span>
      <span className="area-tile-count">{count}</span>
    </button>
  )
}
