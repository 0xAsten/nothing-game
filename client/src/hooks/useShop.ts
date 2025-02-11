'use client'

import { useCallback, useState, useEffect } from 'react'
import {
  useAccount,
  useContract,
  useSendTransaction,
} from '@starknet-react/core'
import { SHOP_SYSTEM } from '../config/contracts'
import { getPlayerShop } from '@/services/game.service'
import { ShopData } from '@/types/game'
import { subscribeToShopUpdates } from '@/services/subscriptions'

interface UseShopResult {
  isRerolling: boolean
  error: string | null
  clearError: () => void
  rerollShop: () => Promise<boolean>
  shopData: ShopData | null
}

export function useShop(): UseShopResult {
  const { address } = useAccount()
  const [isRerolling, setIsRerolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shopData, setShopData] = useState<ShopData | null>(null)

  const { contract } = useContract({
    abi: SHOP_SYSTEM!.abi,
    address: SHOP_SYSTEM!.address as `0x${string}`,
  })

  const {
    isError,
    error: sendError,
    send,
    isPending,
  } = useSendTransaction({
    calls: contract ? [contract.populate('reroll_shop', [])] : undefined,
  })

  // Subscribe to shop updates
  useEffect(() => {
    if (!address) return

    const unsubscribe = subscribeToShopUpdates(address, {
      onData: (newShopData) => {
        if (newShopData) {
          setShopData(newShopData)
          setIsRerolling(false)
        }
      },
      onError: (err) => {
        console.error('Shop subscription error:', err)
        setError('Failed to get shop updates')
      },
    })

    return () => {
      unsubscribe()
    }
  }, [address])

  // Monitor transaction status
  useEffect(() => {
    if (isPending) {
      setIsRerolling(true)
    } else if (!isPending && isError) {
      setIsRerolling(false)
      setError(sendError?.message || 'Transaction failed')
    }
  }, [isPending, isError, sendError])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const rerollShop = async () => {
    if (!address || !contract || !send) {
      setError('Contract not initialized')
      return false
    }

    try {
      setError(null)
      send()
      return true
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to reroll shop. Please try again.'

      console.error('Error rerolling shop:', error)
      setError(errorMessage)
      return false
    }
  }

  return {
    isRerolling,
    error,
    clearError,
    rerollShop,
    shopData,
  }
}
