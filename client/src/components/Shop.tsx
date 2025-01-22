import React from 'react'
import { Item } from '@/types/game'
import { REROLL_COST } from '@/constants/gameData'
import Image from 'next/image'

interface ShopProps {
  items: Item[]
  gold: number
  onReroll: () => void
  onDragStart: (item: Item) => void
  onPurchase: (item: Item) => void
}

const Shop: React.FC<ShopProps> = ({
  items,
  gold,
  onReroll,
  onDragStart,
  onPurchase,
}) => {
  const handleDragStart = (e: React.DragEvent, item: Item) => {
    if (gold < item.price) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData('text/plain', item.item_id.toString())
    onDragStart(item)
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
        {items.map((item) => {
          const canAfford = gold >= item.price
          return (
            <div
              key={item.item_id}
              draggable={canAfford}
              onDragStart={(e) => handleDragStart(e, item)}
              className={`p-4 bg-white border border-gray-200 rounded-lg ${
                canAfford
                  ? 'cursor-move hover:border-gray-300'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start gap-3">
                {item.image_url && (
                  <div className="w-12 h-12 relative">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <div className="mt-1 text-sm text-gray-500">
                    {item.width}×{item.height}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-amber-500 font-medium">
                      {item.price}
                    </span>
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
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Shop
