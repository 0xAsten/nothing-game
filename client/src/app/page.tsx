'use client'

import React from 'react'
import Grid from '@/components/Grid'
import Shop from '@/components/Shop'
import {
  INITIAL_PLAYER_STATS,
  SAMPLE_ITEMS,
  REROLL_COST,
} from '@/constants/gameData'
import { GameState, Item, GridPosition, ItemType } from '@/types/game'
import { validatePlacement, calculateSpecialEffects } from '@/utils/gridUtils'

export default function Home() {
  const [gameState, setGameState] = React.useState<GameState>({
    playerStats: INITIAL_PLAYER_STATS,
    inventory: [],
    shopItems: [],
    selectedItem: undefined,
    previewPosition: undefined,
    previewRotation: 0,
  })

  const handleReroll = () => {
    if (gameState.playerStats.gold < REROLL_COST) return

    const shopItems = Object.values(SAMPLE_ITEMS)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)

    setGameState((prev) => ({
      ...prev,
      playerStats: {
        ...prev.playerStats,
        gold: prev.playerStats.gold - REROLL_COST,
      },
      shopItems: shopItems,
    }))
  }

  const handleDragStart = (item: Item, index: number) => {
    setGameState((prev) => ({
      ...prev,
      selectedItem: item,
    }))
  }

  const handleDragEnd = () => {
    setGameState((prev) => ({
      ...prev,
      selectedItem: undefined,
      previewPosition: undefined,
      previewRotation: 0,
    }))
  }

  const handleDragOver = (position: GridPosition) => {
    // console.log('handleDragOver', position)
    setGameState((prev) => ({
      ...prev,
      previewPosition: position,
    }))
  }

  const handleRotate = () => {
    if (!gameState.selectedItem) return

    setGameState((prev) => ({
      ...prev,
      previewRotation: (((prev.previewRotation || 0) + 90) % 360) as
        | 0
        | 90
        | 180
        | 270,
    }))
  }

  const handleDrop = (position: GridPosition) => {
    const { selectedItem, inventory, previewRotation } = gameState
    if (!selectedItem) {
      // Reset preview state even if no item is selected
      setGameState((prev) => ({
        ...prev,
        selectedItem: undefined,
        previewPosition: undefined,
        previewRotation: 0,
      }))
      return
    }

    // Check if this is a bag and if there are non-bag items already placed
    if (
      selectedItem.item_type === ItemType.BAG &&
      inventory.some((item) => item.item_type !== ItemType.BAG)
    ) {
      // Reset preview state when placement is invalid
      setGameState((prev) => ({
        ...prev,
        selectedItem: undefined,
        previewPosition: undefined,
        previewRotation: 0,
      }))
      return
    }

    const validation = validatePlacement(
      selectedItem,
      position,
      previewRotation || 0,
      inventory,
    )

    if (!validation.isValid) {
      // Reset preview state when placement is invalid
      setGameState((prev) => ({
        ...prev,
        selectedItem: undefined,
        previewPosition: undefined,
        previewRotation: 0,
      }))
      return
    }

    const newItem = {
      ...selectedItem,
      position,
      rotation: (previewRotation || 0) as 0 | 90 | 180 | 270,
    }

    setGameState((prev) => {
      const newInventory = [...prev.inventory, newItem]
      const specialEffects = calculateSpecialEffects(newInventory)

      return {
        ...prev,
        inventory: newInventory,
        playerStats: {
          ...prev.playerStats,
          gold: prev.playerStats.gold - selectedItem.price,
          attack: INITIAL_PLAYER_STATS.attack + specialEffects.attack,
          defense: INITIAL_PLAYER_STATS.defense + specialEffects.defense,
          health: INITIAL_PLAYER_STATS.health + specialEffects.health,
        },
        selectedItem: undefined,
        previewPosition: undefined,
        previewRotation: 0,
      }
    })
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-4 shadow-sm mb-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Player Stats
                </h2>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-medium">
                      {gameState.playerStats.gold}
                    </span>
                    <span className="text-gray-600">Gold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-medium">
                      {gameState.playerStats.attack}
                    </span>
                    <span className="text-gray-600">ATK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 font-medium">
                      {gameState.playerStats.defense}
                    </span>
                    <span className="text-gray-600">DEF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-medium">
                      {gameState.playerStats.health}
                    </span>
                    <span className="text-gray-600">HP</span>
                  </div>
                </div>
              </div>
            </div>
            <Grid
              items={gameState.inventory}
              selectedItem={gameState.selectedItem}
              previewPosition={gameState.previewPosition}
              previewRotation={gameState.previewRotation}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onRotate={handleRotate}
            />
          </div>
          <div>
            <Shop
              items={gameState.shopItems}
              gold={gameState.playerStats.gold}
              onReroll={handleReroll}
              onDragStart={handleDragStart}
              onPurchase={() => {}}
              onDragEnd={handleDragEnd}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
