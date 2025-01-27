'use client'

import React from 'react'
import Grid from '@/components/Grid'
import Shop from '@/components/Shop'
import {
  INITIAL_PLAYER_STATS,
  SAMPLE_ITEMS,
  REROLL_COST,
} from '@/constants/gameData'
import { GameState, Item, GridPosition, PlacedItem } from '@/types/game'
import {
  validatePlacement,
  calculateSpecialEffects,
  getEmptySlotId,
} from '@/utils/gridUtils'

export default function Home() {
  const [gameState, setGameState] = React.useState<GameState>({
    playerStats: INITIAL_PLAYER_STATS,
    inventory: [],
    inventoryCount: 0,
    shopItems: [],
    selectedItem: undefined,
    selectedItemIndex: undefined,
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
      selectedItemIndex: index,
      previewRotation: 0,
    }))
  }

  const handleDragEnd = () => {
    setGameState((prev) => ({
      ...prev,
      selectedItem: undefined,
      selectedItemIndex: undefined,
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

    const newRotation = (((gameState.previewRotation || 0) + 90) % 360) as
      | 0
      | 90
      | 180
      | 270

    setGameState((prev) => ({
      ...prev,
      previewRotation: newRotation,
    }))
  }

  const handleDrop = (position: GridPosition) => {
    const { selectedItem, inventory, inventoryCount, previewRotation } =
      gameState
    if (!selectedItem) {
      setGameState((prev) => ({
        ...prev,
        selectedItem: undefined,
        selectedItemIndex: undefined,
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
      setGameState((prev) => ({
        ...prev,
        selectedItem: undefined,
        selectedItemIndex: undefined,
        previewPosition: undefined,
        previewRotation: 0,
      }))
      return
    }

    const newId = getEmptySlotId(inventory, inventoryCount)
    const newItem = {
      ...selectedItem,
      id: newId,
      position,
      rotation: (previewRotation || 0) as 0 | 90 | 180 | 270,
    }

    setGameState((prev) => {
      const newInventory = [...prev.inventory, newItem]
      const specialEffects = calculateSpecialEffects(newInventory)

      return {
        ...prev,
        shopItems: prev.shopItems.filter(
          (_, index) => index !== prev.selectedItemIndex,
        ),
        inventory: newInventory,
        inventoryCount: newId > inventoryCount ? newId : inventoryCount,
        playerStats: {
          ...prev.playerStats,
          gold: prev.playerStats.gold - selectedItem.price,
          attack:
            INITIAL_PLAYER_STATS.attack +
            newItem.attack +
            specialEffects.attack,
          defense:
            INITIAL_PLAYER_STATS.defense +
            newItem.defense +
            specialEffects.defense,
          health:
            INITIAL_PLAYER_STATS.health +
            newItem.health +
            specialEffects.health,
        },
        selectedItem: undefined,
        selectedItemIndex: undefined,
        previewPosition: undefined,
        previewRotation: 0,
      }
    })
  }

  const handleDiscardItem = (id: number) => {
    setGameState((prev) => {
      const item = prev.inventory.find((i) => i.id === id)
      if (!item) return prev
      const newInventory = prev.inventory.filter((i) => i.id !== id)
      const specialEffects = calculateSpecialEffects(newInventory)

      return {
        ...prev,
        inventory: newInventory,
        playerStats: {
          ...prev.playerStats,
          attack:
            INITIAL_PLAYER_STATS.attack - item.attack + specialEffects.attack,
          defense:
            INITIAL_PLAYER_STATS.defense -
            item.defense +
            specialEffects.defense,
          health:
            INITIAL_PLAYER_STATS.health - item.health + specialEffects.health,
        },
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
              inventoryCount={gameState.inventoryCount}
              selectedItem={gameState.selectedItem}
              previewPosition={gameState.previewPosition}
              previewRotation={gameState.previewRotation}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onRotate={handleRotate}
              onDiscardItem={handleDiscardItem}
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
              onRotate={handleRotate}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
