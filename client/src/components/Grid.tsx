import React from 'react';
import Image from 'next/image';
import { GRID_WIDTH, GRID_HEIGHT } from '@/constants/gameData';
import { PlacedItem, GridPosition } from '@/types/game';

interface GridProps {
  items: PlacedItem[];
  onDrop: (position: GridPosition) => void;
  onDragOver: (position: GridPosition) => void;
}

const Grid: React.FC<GridProps> = ({ items, onDrop, onDragOver }) => {
  const cells = Array.from({ length: GRID_HEIGHT }, (_, y) =>
    Array.from({ length: GRID_WIDTH }, (_, x) => ({ x, y }))
  );

  const handleDragOver = (e: React.DragEvent, position: GridPosition) => {
    e.preventDefault();
    onDragOver(position);
  };

  const handleDrop = (e: React.DragEvent, position: GridPosition) => {
    e.preventDefault();
    onDrop(position);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="relative" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))`,
        gap: '1px',
        backgroundColor: '#e5e7eb',
        padding: '1px',
        borderRadius: '4px',
      }}>
        {cells.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="aspect-square bg-white"
              onDragOver={(e) => handleDragOver(e, { x, y })}
              onDrop={(e) => handleDrop(e, { x, y })}
            />
          ))
        )}
        {items.map((item) => (
          <div
            key={`item-${item.item_id}-${item.position.x}-${item.position.y}`}
            className="absolute"
            style={{
              left: `${(item.position.x / GRID_WIDTH) * 100}%`,
              bottom: `${(item.position.y / GRID_HEIGHT) * 100}%`,
              width: `${(item.width / GRID_WIDTH) * 100}%`,
              height: `${(item.height / GRID_HEIGHT) * 100}%`,
              transform: `rotate(${item.rotation}deg)`,
            }}
          >
            <div className="w-full h-full relative bg-blue-50 border-2 border-blue-500 rounded p-1">
              {item.image_url && (
                <div className="absolute inset-0 p-2">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div className="absolute bottom-1 left-1 right-1">
                <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                <div className="flex gap-1 text-xs">
                  {item.attack > 0 && <span className="text-red-500">+{item.attack}ATK</span>}
                  {item.defense > 0 && <span className="text-blue-500">+{item.defense}DEF</span>}
                  {item.health > 0 && <span className="text-green-500">+{item.health}HP</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grid;
