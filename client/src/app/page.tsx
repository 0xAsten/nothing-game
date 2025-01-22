'use client';

import { useState, useCallback } from 'react';
import Grid from '@/components/Grid';
import Shop from '@/components/Shop';
import { GameState, Item, GridPosition, PlacedItem } from '@/types/game';
import { INITIAL_PLAYER_STATS, SAMPLE_ITEMS, REROLL_COST } from '@/constants/gameData';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    playerStats: INITIAL_PLAYER_STATS,
    inventory: [],
    shopItems: SAMPLE_ITEMS.slice(0, 4),
  });

  const [draggedItem, setDraggedItem] = useState<Item | null>(null);

  const handleReroll = useCallback(() => {
    if (gameState.playerStats.gold >= REROLL_COST) {
      setGameState(prev => ({
        ...prev,
        playerStats: {
          ...prev.playerStats,
          gold: prev.playerStats.gold - REROLL_COST
        },
        shopItems: [...SAMPLE_ITEMS].sort(() => Math.random() - 0.5).slice(0, 4)
      }));
    }
  }, [gameState.playerStats.gold]);

  const handleDragStart = useCallback((item: Item) => {
    setDraggedItem(item);
  }, []);

  const handleDrop = useCallback((position: GridPosition) => {
    if (!draggedItem || gameState.playerStats.gold < draggedItem.price) {
      return;
    }

    const newItem: PlacedItem = {
      ...draggedItem,
      position,
      rotation: 0,
    };

    setGameState(prev => ({
      ...prev,
      playerStats: {
        ...prev.playerStats,
        gold: prev.playerStats.gold - draggedItem.price,
        attack: prev.playerStats.attack + draggedItem.attack,
        defense: prev.playerStats.defense + draggedItem.defense,
        health: prev.playerStats.health + draggedItem.health,
      },
      inventory: [...prev.inventory, newItem],
    }));

    setDraggedItem(null);
  }, [draggedItem, gameState.playerStats.gold]);

  const handleDragOver = useCallback((position: GridPosition) => {
    // Implement preview logic here
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Grid Equipment Game</h1>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex items-center gap-2">
            <span className="text-amber-500 font-medium">{gameState.playerStats.gold}</span>
            <span className="text-gray-600">Gold</span>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex items-center gap-2">
            <span className="text-red-500 font-medium">{gameState.playerStats.attack}</span>
            <span className="text-gray-600">Attack</span>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex items-center gap-2">
            <span className="text-blue-500 font-medium">{gameState.playerStats.defense}</span>
            <span className="text-gray-600">Defense</span>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex items-center gap-2">
            <span className="text-green-500 font-medium">{gameState.playerStats.health}</span>
            <span className="text-gray-600">Health</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory</h2>
            <Grid
              items={gameState.inventory}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
          </div>
          
          <div>
            <Shop
              items={gameState.shopItems}
              gold={gameState.playerStats.gold}
              onReroll={handleReroll}
              onDragStart={handleDragStart}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
