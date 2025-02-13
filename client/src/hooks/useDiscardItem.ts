'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  useAccount,
  useContract,
  useSendTransaction,
} from '@starknet-react/core'
import { CHARACTER_SYSTEM } from '../config/contracts'
import { GridPosition, Item } from '@/types/game'

interface UseDiscardItemResult {
  isDiscarding: boolean
  error: string | null
  clearError: () => void
  discardItem: (slotId: number) => Promise<boolean>
}

export function useDiscardItem(): UseDiscardItemResult {
  const { address } = useAccount()
  const [isDiscarding, setIsDiscarding] = useState(false)
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
      setIsDiscarding(true)
    } else if (!isPending && isError) {
      setIsDiscarding(false)
      setError(sendError?.message || 'Transaction failed')
    } else if (!isPending && !isError) {
      setIsDiscarding(false)
      setError(null)
    }
  }, [isPending, isError, sendError])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const discardItem = async (slotId: number) => {
    console.log('discardItem', slotId)

    if (!address || !contract || !sendAsync) {
      setError('Contract not initialized')
      return false
    }

    try {
      setError(null)
      await sendAsync([contract.populate('remove_item', [slotId])])
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
    isDiscarding,
    error,
    clearError,
    discardItem,
  }
}
