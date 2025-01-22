import React from 'react';
import { Item } from '@/types/game';
import { REROLL_COST } from '@/constants/gameData';
import Image from 'next/image';

interface ShopProps {
  items: Item[];
  gold: number;
  onReroll: () => void;
  onDragStart: (item: Item) => void;
}

const Shop: React.FC<ShopProps> = ({ items, gold, onReroll, onDragStart }) => {
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
        {items.map((item) => (
          <div
            key={item.item_id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', item.item_id.toString());
              onDragStart(item);
            }}
            className="p-4 bg-white border border-gray-200 rounded-lg cursor-move hover:border-gray-300"
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
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500 font-medium">{item.price}</span>
                    <span className="text-gray-500">gold</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Size: {item.width}x{item.height}
                </div>
                <div className="flex gap-2 mt-2">
                  {item.attack > 0 && (
                    <span className="text-red-500 text-sm">+{item.attack}ATK</span>
                  )}
                  {item.defense > 0 && (
                    <span className="text-blue-500 text-sm">+{item.defense}DEF</span>
                  )}
                  {item.health > 0 && (
                    <span className="text-green-500 text-sm">+{item.health}HP</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
