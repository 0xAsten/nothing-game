import React, { useCallback } from 'react'
import Image from 'next/image'
import { GRID_WIDTH, GRID_HEIGHT } from '@/constants/gameData'
import { PlacedItem, GridPosition, Item, ItemType } from '@/types/game'
import {
  getOccupiedCells,
  validatePlacement,
  getRotatedDimensions,
  isBagEmpty,
  getEmptySlotId,
} from '@/utils/gridUtils'

interface GridProps {
  items: PlacedItem[]
  inventoryCount: number
  selectedItem?: Item
  previewPosition?: GridPosition
  previewRotation?: 0 | 90 | 180 | 270
  onDrop: (position: GridPosition) => void
  onDragOver: (position: GridPosition) => void
  onRotate: () => void
  onDiscardItem?: (id: number) => void
}

const Grid: React.FC<GridProps> = ({
  items,
  inventoryCount,
  selectedItem,
  previewPosition,
  previewRotation,
  onDrop,
  onDragOver,
  onRotate,
  onDiscardItem,
}) => {
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null)
  const gridRef = React.useRef<HTMLDivElement>(null)

  const cells = Array.from({ length: GRID_HEIGHT }, (_, y) =>
    Array.from({ length: GRID_WIDTH }, (_, x) => ({ x, y })),
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent, position: GridPosition) => {
      e.preventDefault()
      if (!position) return
      onDragOver(position)
    },
    [onDragOver],
  )

  const handleDrop = (e: React.DragEvent, position: GridPosition) => {
    e.preventDefault()
    onDrop(position)
  }

  const handleDragStart = (e: React.DragEvent, item: PlacedItem) => {
    if (!onDiscardItem) return
    if (item.item_type === ItemType.BAG && !isBagEmpty(item, items)) {
      e.preventDefault()
      return
    }

    setDraggingIndex(item.id)

    e.dataTransfer.setData('text/plain', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'move'

    if (item.image_url) {
      const img = document.createElement('img')
      img.src = item.image_url
      e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2)
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (!draggingIndex || !onDiscardItem || !gridRef.current) return

    const gridRect = gridRef.current.getBoundingClientRect()
    const isOutsideGrid =
      e.clientX < gridRect.left ||
      e.clientX > gridRect.right ||
      e.clientY < gridRect.top ||
      e.clientY > gridRect.bottom

    if (isOutsideGrid) {
      onDiscardItem(draggingIndex)
    }

    setDraggingIndex(null)
  }

  const renderItem = (item: PlacedItem) => {
    const cellSize = 64 // Base cell size in pixels
    const { width, height } = getRotatedDimensions(item, item.rotation)

    const originalWidth = item.width * cellSize
    const originalHeight = item.height * cellSize

    const isDragging = item.id === draggingIndex

    return (
      <div
        key={`item-${item.item_id}-${item.position.x}-${item.position.y}`}
        className={`absolute transition-all duration-200 ${
          selectedItem ? 'pointer-events-none' : ''
        } ${item.isValid === false ? 'opacity-50' : ''} ${
          isDragging ? 'opacity-0' : ''
        }`}
        style={{
          left: `${item.position.x * cellSize}px`,
          bottom: `${item.position.y * cellSize}px`,
          width: `${width * cellSize}px`,
          height: `${height * cellSize}px`,
          cursor:
            onDiscardItem &&
            (item.item_type !== ItemType.BAG || isBagEmpty(item, items))
              ? 'grab'
              : 'default',
        }}
        draggable={!!onDiscardItem}
        onDragStart={(e) => handleDragStart(e, item)}
        onDragEnd={handleDragEnd}
      >
        {item.image_url && (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={item.image_url}
              alt={item.name}
              style={{
                width: originalWidth,
                height: originalHeight,
                transform: `rotate(${item.rotation}deg)`,
                transformOrigin: 'center',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
          </div>
        )}
      </div>
    )
  }

  const renderPreview = useCallback(() => {
    if (!selectedItem || !previewPosition) return null

    const { width, height } = getRotatedDimensions(
      selectedItem,
      previewRotation || 0,
    )

    let adjustedPosition = { ...previewPosition }

    switch (previewRotation) {
      case 90:
        adjustedPosition = previewPosition
        break
      case 180:
        adjustedPosition = {
          x: previewPosition.x,
          y: previewPosition.y - height + 1,
        }
        break
      case 270:
        adjustedPosition = {
          x: previewPosition.x - width + 1,
          y: previewPosition.y,
        }
        break
      default:
        adjustedPosition = previewPosition
    }

    const previewItem: PlacedItem = {
      ...selectedItem,
      id: getEmptySlotId(items, inventoryCount),
      position: adjustedPosition,
      rotation: previewRotation || 0,
    }

    const validation = validatePlacement(
      previewItem,
      previewItem.position,
      previewRotation || 0,
      items,
    )
    previewItem.isValid = validation.isValid

    return renderItem(previewItem)
  }, [selectedItem, previewPosition, previewRotation, items])

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div
        ref={gridRef}
        className="relative"
        style={{
          width: `${GRID_WIDTH * 64}px`,
          height: `${GRID_HEIGHT * 64}px`,
        }}
      >
        <div
          className="absolute inset-0 grid-cells"
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
              ></div>
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
