import React from 'react'
import Image from 'next/image'
import { GRID_WIDTH, GRID_HEIGHT } from '@/constants/gameData'
import { PlacedItem, GridPosition, Item } from '@/types/game'
import {
  getOccupiedCells,
  validatePlacement,
  getRotatedDimensions,
} from '@/utils/gridUtils'

interface GridProps {
  items: PlacedItem[]
  selectedItem?: Item
  previewPosition?: GridPosition
  previewRotation?: 0 | 90 | 180 | 270
  onDrop: (position: GridPosition) => void
  onDragOver: (position: GridPosition) => void
  onRotate: () => void
}

const Grid: React.FC<GridProps> = ({
  items,
  selectedItem,
  previewPosition,
  previewRotation,
  onDrop,
  onDragOver,
  onRotate,
}) => {
  const cells = Array.from({ length: GRID_HEIGHT }, (_, y) =>
    Array.from({ length: GRID_WIDTH }, (_, x) => ({ x, y })),
  )

  const handleDragOver = (e: React.DragEvent, position: GridPosition) => {
    e.preventDefault()
    onDragOver(position)
  }

  const handleDrop = (e: React.DragEvent, position: GridPosition) => {
    e.preventDefault()
    onDrop(position)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'r' || e.key === 'R') {
      onRotate()
    }
  }

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onRotate])

  const renderItem = (item: PlacedItem) => {
    const { width, height } = getRotatedDimensions(item, item.rotation)
    const cellSize = 64 // Base cell size in pixels

    return (
      <div
        key={`item-${item.item_id}-${item.position.x}-${item.position.y}`}
        className={`absolute transition-all duration-200 ${
          item.isValid === false ? 'opacity-50' : ''
        }`}
        style={{
          left: `${item.position.x * cellSize}px`,
          bottom: `${item.position.y * cellSize}px`,
          width: `${width * cellSize}px`,
          height: `${height * cellSize}px`,
          transform: `rotate(${item.rotation}deg)`,
          transformOrigin: 'bottom left',
        }}
      >
        {item.image_url && (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-contain"
          />
        )}
      </div>
    )
  }

  const renderPreview = () => {
    if (!selectedItem || !previewPosition) return null

    console.log('renderPreview', previewPosition)

    const previewItem: PlacedItem = {
      ...selectedItem,
      position: previewPosition,
      rotation: previewRotation || 0,
    }

    const validation = validatePlacement(
      previewItem,
      previewPosition,
      previewRotation || 0,
      items,
    )
    previewItem.isValid = validation.isValid

    return renderItem(previewItem)
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div
        className="relative"
        style={{
          width: `${GRID_WIDTH * 64}px`,
          height: `${GRID_HEIGHT * 64}px`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))`,
            gap: '1px',
            backgroundColor: '#e5e7eb',
            padding: '1px',
            borderRadius: '4px',
          }}
        >
          {/* the value of y need to be reverse */}
          {cells.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className="aspect-square bg-white hover:bg-gray-50"
                onDragOver={(e) =>
                  handleDragOver(e, { x, y: GRID_HEIGHT - y - 1 })
                }
                onDrop={(e) => handleDrop(e, { x, y: GRID_HEIGHT - y - 1 })}
              >
                <span>{x}</span>
                <span>{y}</span>
              </div>
            )),
          )}
        </div>
        {items.map(renderItem)}
        {renderPreview()}
      </div>
    </div>
  )
}

export default Grid
