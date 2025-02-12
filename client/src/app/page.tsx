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
} from '@/services/game.service'
import { useUser } from '@/contexts/UserContext'
import { useShop } from '@/hooks/useShop'
import { useReset } from '@/hooks/useReset'
import { ResetDialog } from '@/components/ResetDialog'
import { useBuyItem } from '@/hooks/useBuyItem'
import { Alert } from '@/components/ui/Alert'

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

  const [gameState, setGameState] = React.useState<GameState>({
    playerStats: userStats || INITIAL_PLAYER_STATS,
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
      const [shopData, itemsData] = await Promise.all([
        getPlayerShop(address),
        getPlayerItems(address),
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
        shopItems: shopData
          ? [
              shopData.item1_id,
              shopData.item2_id,
              shopData.item3_id,
              shopData.item4_id,
            ]
              .map((itemId) => SAMPLE_ITEMS[itemId])
              .filter(Boolean)
          : [],
      }))
    }

    loadGameData()
  }, [address])

  const handleReroll = async () => {
    if (!userStats || userStats.gold < REROLL_COST || isRerolling) return

    const success = await rerollShop()
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
          .map((itemId) => SAMPLE_ITEMS[itemId])
          .filter(Boolean),
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

  const handleDrop = async (position: GridPosition) => {
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

    // Call buyItem before updating the local state
    const success = await buyItem(
      selectedItem.item_id,
      position,
      previewRotation || 0,
    )

    if (!success) {
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
      setPreviousStats(prev.playerStats)

      const newInventory = [...prev.inventory, newItem]

      return {
        ...prev,
        shopItems: prev.shopItems.filter(
          (_, index) => index !== prev.selectedItemIndex,
        ),
        inventory: newInventory,
        inventoryCount: newId > inventoryCount ? newId : inventoryCount,
        selectedItem: undefined,
        selectedItemIndex: undefined,
        previewPosition: undefined,
        previewRotation: 0,
      }
    })
  }

  const handleDiscardItem = (id: number) => {
    setGameState((prev) => {
      setPreviousStats(prev.playerStats)

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
    </main>
  )
}
