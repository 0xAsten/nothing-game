import React from 'react'
import { Item } from '@/types/game'
import { REROLL_COST } from '@/constants/gameData'
import Image from 'next/image'
import { ItemType, SpecialEffect } from '@/types/game'
import { Alert } from './ui/Alert'

interface ShopProps {
  items: Item[]
  gold: number
  onReroll: () => void
  onDragStart: (item: Item, index: number) => void
  onPurchase: (item: Item) => void
  onDragEnd: () => void
  onRotate: () => void
  isRerolling?: boolean
  error?: string | null
  onErrorDismiss?: () => void
  isBuying?: boolean
}

const Shop: React.FC<ShopProps> = ({
  items,
  gold,
  onReroll,
  onDragStart,
  onPurchase,
  onDragEnd,
  onRotate,
  isRerolling = false,
  error,
  onErrorDismiss,
  isBuying = false,
}) => {
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null)
  const dragImages = React.useRef<{ [key: string]: HTMLImageElement }>({})
  const [isShiftPressed, setIsShiftPressed] = React.useState(false)

  React.useEffect(() => {
    items.forEach((item) => {
      if (item.image_url && !dragImages.current[item.image_url]) {
        const img = document.createElement('img')
        img.src = item.image_url

        const canvas = document.createElement('canvas')
        canvas.width = 48
        canvas.height = 48

        img.onload = () => {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            const size = Math.min(img.width, img.height)
            const x = (img.width - size) / 2
            const y = (img.height - size) / 2
            ctx.drawImage(img, x, y, size, size, 0, 0, 48, 48)

            const scaledImg = document.createElement('img')
            scaledImg.src = canvas.toDataURL()
            dragImages.current[item.image_url!] = scaledImg
          }
        }
      }
    })
  }, [items])

  // Add this effect to clear dragging state when items change
  React.useEffect(() => {
    setDraggingIndex(null)
  }, [items])

  const handleDragStart = (e: React.DragEvent, item: Item, index: number) => {
    if (gold < item.price) {
      e.preventDefault()
      return
    }

    // Clear any existing dragging state first
    setDraggingIndex(null)

    // Small timeout to ensure state is cleared before setting new index
    setTimeout(() => {
      setDraggingIndex(index)
    }, 0)

    if (item.image_url && dragImages.current[item.image_url]) {
      e.dataTransfer.setDragImage(dragImages.current[item.image_url], 24, 24)
    }

    e.dataTransfer.setData('text/plain', item.item_id.toString())
    onDragStart(item, index)
  }

  const handleDragEnd = () => {
    // Use a callback to ensure we're working with the latest state
    setDraggingIndex((currentIndex) => {
      if (currentIndex !== null) {
        onDragEnd()
      }
      return null
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    if (e.shiftKey !== isShiftPressed) {
      setIsShiftPressed(e.shiftKey)
      if (e.shiftKey) {
        onRotate()
      }
    }
  }

  const renderItemCard = (item: Item, index: number) => {
    const canAfford = gold >= item.price
    const isDragging = index === draggingIndex

    return (
      <div
        key={index}
        draggable={canAfford}
        onDrag={handleDrag}
        onDragStart={(e) => handleDragStart(e, item, index)}
        onDragEnd={handleDragEnd}
        className={`shop-item ${isDragging ? 'opacity-0' : ''} ${
          !canAfford ? 'shop-item-disabled' : ''
        } ${
          item.stack_group_id ? `shop-item-stack-${item.stack_group_id}` : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gray-800/30 rounded-lg flex items-center justify-center">
              {item.image_url && (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-amber-500/90 rounded-md text-white text-sm font-medium">
              {item.price}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-100">{item.name}</h3>
            <div className="text-sm text-gray-400 mt-1">
              Size: {item.width}×{item.height}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.attack > 0 && (
            <span className="stat-badge stat-badge-atk">
              +{item.attack} ATK
            </span>
          )}
          {item.defense > 0 && (
            <span className="stat-badge stat-badge-def">
              +{item.defense} DEF
            </span>
          )}
          {item.health > 0 && (
            <span className="stat-badge stat-badge-hp">+{item.health} HP</span>
          )}
        </div>

        {item.item_type === ItemType.ACCESSORY && item.special_effect && (
          <div className="mt-2 text-sm font-medium text-purple-300">
            Enhance {item.special_effect}
            {item.special_effect_stacks && item.special_effect_stacks > 1 && (
              <span className="ml-1">({item.special_effect_stacks})</span>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div
        className={`shop-container ${isRerolling ? 'rerolling' : ''} ${
          isBuying ? 'buying-active' : ''
        }`}
      >
        <div className="shop-header">
          <div className="flex items-center gap-4">
            <h2 className="shop-title">Shop</h2>
            <div className="stat-badge stat-badge-gold">{gold} Gold</div>
          </div>
          <button
            onClick={onReroll}
            disabled={gold < REROLL_COST || isRerolling}
            className="reroll-button"
          >
            {isRerolling ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                Rerolling...
              </span>
            ) : (
              `Reroll (${REROLL_COST} gold)`
            )}
          </button>
        </div>
        <div
          className={`shop-items-grid ${isRerolling ? 'animate-pulse' : ''}`}
        >
          {items.map((item, index) => renderItemCard(item, index))}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={onErrorDismiss} />}
    </>
  )
}

const getStackGroupColor = (groupId: number): string => {
  const colors = ['blue', 'green', 'yellow', 'red', 'purple', 'pink', 'orange']
  return colors[groupId % colors.length]
}

export default Shop
