'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  useAccount,
  useContract,
  useSendTransaction,
} from '@starknet-react/core'
import { CHARACTER_SYSTEM } from '../config/contracts'
import { GridPosition, Item } from '@/types/game'

interface UseBuyItemResult {
  isBuying: boolean
  error: string | null
  clearError: () => void
  buyItem: (
    itemId: number,
    position: GridPosition,
    rotation: number,
  ) => Promise<boolean>
}

export function useBuyItem(): UseBuyItemResult {
  const { address } = useAccount()
  const [isBuying, setIsBuying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { contract } = useContract({
    abi: CHARACTER_SYSTEM!.abi,
    address: CHARACTER_SYSTEM!.address as `0x${string}`,
  })

  const {
    isError,
    error: sendError,
    sendAsync,
    isPending,
  } = useSendTransaction({ calls: [] })

  // Monitor transaction status
  useEffect(() => {
    if (isPending) {
      setIsBuying(true)
    } else if (!isPending && isError) {
      setIsBuying(false)
      setError(sendError?.message || 'Transaction failed')
    } else if (!isPending && !isError) {
      setIsBuying(false)
      setError(null)
    }
  }, [isPending, isError, sendError])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const buyItem = async (
    itemId: number,
    position: GridPosition,
    rotation: number,
  ) => {
    console.log('buyItem', itemId, position, Math.floor(rotation / 90))
    if (!address || !contract || !sendAsync) {
      setError('Contract not initialized')
      return false
    }

    try {
      setError(null)
      await sendAsync([
        contract.populate('buy_item', [
          itemId,
          position.x,
          position.y,
          Math.floor(rotation / 90), // Convert rotation from degrees to 0-3
        ]),
      ])
      return true
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to buy item. Please try again.'

      console.error('Error buying item:', error)
      setError(errorMessage)
      return false
    }
  }

  return {
    isBuying,
    error,
    clearError,
    buyItem,
  }
}
