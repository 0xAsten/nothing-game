'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  useAccount,
  useContract,
  useSendTransaction,
} from '@starknet-react/core'
import { CHARACTER_SYSTEM } from '../config/contracts'

interface UseResetResult {
  isResetting: boolean
  error: string | null
  clearError: () => void
  resetUser: () => Promise<boolean>
  showResetConfirmation: boolean
  setShowResetConfirmation: (show: boolean) => void
}

export function useReset(): UseResetResult {
  const { address } = useAccount()
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResetConfirmation, setShowResetConfirmation] = useState(false)

  const { contract } = useContract({
    abi: CHARACTER_SYSTEM!.abi,
    address: CHARACTER_SYSTEM!.address as `0x${string}`,
  })

  const {
    isError,
    error: sendError,
    send,
    isPending,
  } = useSendTransaction({
    calls: contract ? [contract.populate('reset', [])] : undefined,
  })

  // Monitor transaction status
  useEffect(() => {
    if (isPending) {
      setIsResetting(true)
    } else if (!isPending && isError) {
      setIsResetting(false)
      setError(sendError?.message || 'Transaction failed')
    } else if (!isPending && !isError) {
      setIsResetting(false)
      setError(null)
    }
  }, [isPending, isError, sendError])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const resetUser = async () => {
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
          : 'Failed to reset user. Please try again.'

      console.error('Error resetting user:', error)
      setError(errorMessage)
      return false
    }
  }

  return {
    isResetting,
    error,
    clearError,
    resetUser,
    showResetConfirmation,
    setShowResetConfirmation,
  }
}
