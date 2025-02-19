'use client'

import React from 'react'
import Grid from '@/components/Grid'
import Shop from '@/components/Shop'
import {
  INITIAL_PLAYER_STATS,
  SAMPLE_ITEMS,
  REROLL_COST,
} from '@/constants/gameData'
import {
  GameState,
  Item,
  GridPosition,
  PlacedItem,
  PlayerStats,
  ItemType,
  SpecialEffect,
} from '@/types/game'
import {
  validatePlacement,
  calculateSpecialEffects,
  getEmptySlotId,
} from '@/utils/gridUtils'
import { PlayerStats as PlayerStatsComponent } from '@/components/PlayerStats'
import { useAccount } from '@starknet-react/core'
import {
  getPlayerGrid,
  getPlayerShop,
  getPlayerItems,
  getPlayerItemsRegistry,
} from '@/services/game.service'
import { useUser } from '@/contexts/UserContext'
import { useShop } from '@/hooks/useShop'
import { useReset } from '@/hooks/useReset'
import { ResetDialog } from '@/components/ResetDialog'
import { useBuyItem } from '@/hooks/useBuyItem'
import { Alert } from '@/components/ui/Alert'
import { useDiscardItem } from '@/hooks/useDiscardItem'

const EMPTY_SLOT: Item = {
  item_id: 0,
  name: 'Empty Slot',
  item_type: ItemType.EMPTY,
  rarity: 0,
  width: 1,
  height: 1,
  price: 0,
  attack: 0,
  defense: 0,
  health: 0,
  special_effect: SpecialEffect.NONE,
  special_effect_stacks: 0,
  stack_group_id: 0,
}

export default function Home() {
  const { address } = useAccount()
  const { userStats } = useUser()
  const {
    resetUser,
    isResetting,
    error: resetError,
    showResetConfirmation,
    setShowResetConfirmation,
  } = useReset()

  const {
    isRerolling,
    rerollShop,
    shopData,
    error: shopError,
    clearError,
  } = useShop()

  const {
    buyItem,
    isBuying,
    error: buyError,
    clearError: clearBuyError,
  } = useBuyItem()

  const {
    discardItem,
    isDiscarding,
    error: discardError,
    clearError: clearDiscardError,
  } = useDiscardItem()

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

  const [previousStats, setPreviousStats] = React.useState<
    PlayerStats | undefined
  >()

  React.useEffect(() => {
    if (!address) return

    const loadGameData = async () => {
      const [shopData, itemsData, itemsRegistry] = await Promise.all([
        getPlayerShop(address),
        getPlayerItems(address),
        getPlayerItemsRegistry(address),
      ])

      // Update game state with grid and shop data
      setGameState((prev) => ({
        ...prev,
        inventory: itemsData.map((item) => ({
          ...SAMPLE_ITEMS[item.item_id],
          id: item.slot_id,
          position: { x: item.position.x, y: item.position.y },
          rotation: (item.rotation * 90) as 0 | 90 | 180 | 270,
        })),
        inventoryCount: itemsRegistry?.next_slot_id || 0,
        shopItems: shopData
          ? [
              shopData.item1_id,
              shopData.item2_id,
              shopData.item3_id,
              shopData.item4_id,
            ]
              .map((itemId) =>
                itemId === 0
                  ? { item_id: 0, name: 'Empty Slot' }
                  : SAMPLE_ITEMS[itemId],
              )
              .filter((item): item is Item => Boolean(item))
          : [],
      }))
    }

    loadGameData()
  }, [address])

  React.useEffect(() => {
    if (userStats) {
      setGameState((prev) => ({
        ...prev,
        playerStats: userStats,
      }))
    }
  }, [userStats])

  const handleReroll = async () => {
    if (!userStats || userStats.gold < REROLL_COST || isRerolling) return

    const success = await rerollShop()
    console.log('is reroll success', success)
    if (success) {
      setGameState((prev) => ({
        ...prev,
        playerStats: {
          ...prev.playerStats,
          gold: prev.playerStats.gold - REROLL_COST,
        },
      }))
    }
  }

  React.useEffect(() => {
    if (shopData) {
      setGameState((prev) => ({
        ...prev,
        shopItems: [
          shopData.item1_id,
          shopData.item2_id,
          shopData.item3_id,
          shopData.item4_id,
        ]
          .map((itemId) =>
            itemId === 0
              ? { item_id: 0, name: 'Empty Slot' }
              : SAMPLE_ITEMS[itemId],
          )
          .filter((item): item is Item => Boolean(item)),
      }))
    }
  }, [shopData])

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

  const handleDrop = async (position: GridPosition) => {
    const { selectedItem, inventory, inventoryCount, previewRotation } =
      gameState

    if (!selectedItem) {
      handleDragEnd()
      return
    }

    const validation = validatePlacement(
      selectedItem,
      position,
      previewRotation || 0,
      inventory,
    )

    if (!validation.isValid) {
      handleDragEnd()
      return
    }

    // Create the new item first
    const newId = getEmptySlotId(inventory, inventoryCount)
    const newItem = {
      ...selectedItem,
      id: newId,
      position,
      rotation: (previewRotation || 0) as 0 | 90 | 180 | 270,
    }

    // Update the state immediately to show the item
    setGameState((prev) => {
      setPreviousStats(prev.playerStats)
      return {
        ...prev,
        shopItems: prev.shopItems.map((item, idx) =>
          idx === prev.selectedItemIndex ? EMPTY_SLOT : item,
        ),
        inventory: [...prev.inventory, newItem],
        inventoryCount: newId > inventoryCount ? newId : inventoryCount,
        selectedItem: undefined,
        selectedItemIndex: undefined,
        previewPosition: undefined,
        previewRotation: 0,
      }
    })

    // Call buyItem after updating the local state
    const success = await buyItem(
      selectedItem.item_id,
      position,
      previewRotation || 0,
    )

    // If the transaction failed, revert the changes
    if (!success) {
      setGameState((prev) => ({
        ...prev,
        shopItems: [...prev.shopItems, selectedItem],
        inventory: prev.inventory.filter((item) => item.id !== newId),
        inventoryCount: inventoryCount,
      }))
    }
  }

  const handleDiscardItem = async (id: number) => {
    console.log('handleDiscardItem id:', id)
    const item = gameState.inventory.find((i) => i.id === id)
    if (!item) return

    setGameState((prev) => {
      setPreviousStats(prev.playerStats)

      return {
        ...prev,
        inventory: prev.inventory.filter((i) => i.id !== id),
      }
    })

    const success = await discardItem(id)
    if (!success) {
      setGameState((prev) => ({
        ...prev,
        inventory: [...prev.inventory, item],
      }))
    }
  }

  const handleReset = async () => {
    setShowResetConfirmation(false)
    const success = await resetUser()
    if (success) {
      // Reset local game state
      setGameState({
        playerStats: INITIAL_PLAYER_STATS,
        inventory: [],
        inventoryCount: 0,
        shopItems: [],
        selectedItem: undefined,
        selectedItemIndex: undefined,
        previewPosition: undefined,
        previewRotation: 0,
      })
      setPreviousStats(undefined)
    }
  }

  return (
    <main className="min-h-screen">
      <div className="game-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PlayerStatsComponent
              stats={gameState.playerStats}
              previousStats={previousStats}
            />
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
              isBuying={isBuying}
              isDiscarding={isDiscarding}
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
              isRerolling={isRerolling}
              isBuying={isBuying}
              isDiscarding={isDiscarding}
              error={shopError}
              onErrorDismiss={clearError}
            />
          </div>
        </div>
      </div>

      {/* Fixed position Reset button */}
      <button
        onClick={() => setShowResetConfirmation(true)}
        className="fixed bottom-6 right-6 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors shadow-lg"
      >
        Reset Game
      </button>

      {showResetConfirmation && (
        <ResetDialog
          onConfirm={handleReset}
          onCancel={() => setShowResetConfirmation(false)}
        />
      )}

      {isResetting && (
        <div className="resetting-overlay">
          <div className="resetting-content">
            <h2 className="text-3xl font-bold text-red-500 mb-4">
              Resetting Game...
            </h2>
            <p className="text-gray-400">
              Please wait while your progress is being reset
            </p>
          </div>
        </div>
      )}

      {/* Add error handling for buy errors */}
      {buyError && (
        <Alert type="error" message={buyError} onClose={clearBuyError} />
      )}

      {discardError && (
        <Alert
          type="error"
          message={discardError}
          onClose={clearDiscardError}
        />
      )}
    </main>
  )
}
