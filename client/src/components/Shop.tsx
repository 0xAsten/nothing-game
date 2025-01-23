import React from 'react'
import { Item } from '@/types/game'
import { REROLL_COST } from '@/constants/gameData'
import Image from 'next/image'
import { ItemType, SpecialEffect } from '@/types/game'

interface ShopProps {
  items: Item[]
  gold: number
  onReroll: () => void
  onDragStart: (item: Item, index: number) => void
  onPurchase: (item: Item) => void
  onDragEnd: () => void
}

const Shop: React.FC<ShopProps> = ({
  items,
  gold,
  onReroll,
  onDragStart,
  onPurchase,
  onDragEnd,
}) => {
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null)
  const dragImages = React.useRef<{ [key: string]: HTMLImageElement }>({})

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

  const handleDragStart = (e: React.DragEvent, item: Item, index: number) => {
    if (gold < item.price) {
      e.preventDefault()
      return
    }

    setDraggingIndex(index)

    if (item.image_url && dragImages.current[item.image_url]) {
      e.dataTransfer.setDragImage(dragImages.current[item.image_url], 24, 24)
    }

    e.dataTransfer.setData('text/plain', item.item_id.toString())
    onDragStart(item, index)
  }

  const handleDragEnd = () => {
    setDraggingIndex(null)
    onDragEnd()
  }

  const renderItemCard = (item: Item, index: number) => {
    const canAfford = gold >= item.price
    const isDragging = index === draggingIndex

    return (
      <div
        key={index}
        draggable={canAfford}
        onDragStart={(e) => handleDragStart(e, item, index)}
        onDragEnd={handleDragEnd}
        className={`flex flex-col bg-white border rounded-lg ${
          isDragging ? 'opacity-0' : ''
        } ${
          canAfford
            ? 'cursor-move hover:border-gray-300'
            : 'opacity-50 cursor-not-allowed'
        } ${
          item.stack_group_id
            ? `border-l-4 border-l-${getStackGroupColor(
                item.stack_group_id,
              )}-500`
            : 'border-gray-200'
        }`}
      >
        {/* Top section: Image, Name, Size, Price */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-start gap-3">
            <div className="relative">
              <div className="w-12 h-12">
                {item.image_url && (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 text-amber-500 font-medium">
                {item.price}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <div className="text-sm text-gray-500">
                {item.width}×{item.height}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section: Stats and Effects */}
        <div className="p-4 space-y-2">
          <div className="flex gap-2">
            {item.attack > 0 && (
              <span className="text-red-500">+{item.attack} ATK</span>
            )}
            {item.defense > 0 && (
              <span className="text-blue-500">+{item.defense} DEF</span>
            )}
            {item.health > 0 && (
              <span className="text-green-500">+{item.health} HP</span>
            )}
          </div>
          {item.item_type === ItemType.ACCESSORY && item.special_effect && (
            <div className="text-sm text-purple-600">
              Enhance{' '}
              {item.special_effect === SpecialEffect.ATTACK
                ? 'Attack'
                : item.special_effect === SpecialEffect.DEFENSE
                ? 'Defense'
                : 'Health'}
              {item.special_effect_stacks && item.special_effect_stacks > 1 && (
                <span className="ml-1">({item.special_effect_stacks})</span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">Shop</h2>
          <div className="flex items-center gap-1">
            <span className="text-amber-500 font-medium">{gold}</span>
            <span className="text-gray-600">Gold</span>
          </div>
        </div>
        <button
          onClick={onReroll}
          disabled={gold < REROLL_COST}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Reroll ({REROLL_COST} gold)
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item, index) => renderItemCard(item, index))}
      </div>
    </div>
  )
}

const getStackGroupColor = (groupId: number): string => {
  const colors = ['blue', 'green', 'yellow', 'red', 'purple', 'pink', 'orange']
  return colors[groupId % colors.length]
}

export default Shop
