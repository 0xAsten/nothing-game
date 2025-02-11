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

  // Add effect to monitor transaction status
  useEffect(() => {
    if (isPending) {
      setIsRerolling(true)
    } else if (!isPending) {
      setTimeout(() => {
        setIsRerolling(false)
      }, 1000)

      if (isError) {
        setError(sendError?.message || 'Transaction failed')
      } else if (!isError && !isPending) {
        // Transaction was successful, fetch updated shop data
        setTimeout(() => {
          getPlayerShop(address as `0x${string}`).then((newShopData) => {
            console.log('newShopData', newShopData)
            if (newShopData) {
              setShopData(newShopData)
            }
          })
        }, 1000)
      }
    }
  }, [isPending, isError, sendError, address])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Add error handling for network/API errors
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
