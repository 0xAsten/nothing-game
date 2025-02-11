'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  useAccount,
  useContract,
  useSendTransaction,
} from '@starknet-react/core'
import { getUserStats } from '../services/user.service'
import { CHARACTER_SYSTEM } from '../config/contracts'
import { PlayerStats } from '../types/game'

interface UseUserVerificationResult {
  isLoading: boolean
  isVerified: boolean
  error: string | null
  spawnUser: () => Promise<void>
  userStats: PlayerStats | null
}

export function useUserVerification(): UseUserVerificationResult {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [userStats, setUserStats] = useState<any | null>(null)

  const { contract } = useContract({
    abi: CHARACTER_SYSTEM!.abi,
    address: CHARACTER_SYSTEM!.address as `0x${string}`,
  })

  const { send } = useSendTransaction({
    calls: contract ? [contract.populate('spawn', [])] : undefined,
  })

  const verifyUser = useCallback(async () => {
    if (!address) return false
    const stats = await getUserStats(address)
    if (stats) {
      setUserStats({
        gold: stats.gold,
        health: stats.health,
        attack: stats.attack,
        defense: stats.defense,
      })
    }
    return stats !== null && stats.initialized
  }, [address])

  const startPolling = useCallback(async () => {
    setIsPolling(true)
    let attempts = 0
    const maxAttempts = 20

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setIsPolling(false)
        setError('Timeout waiting for user creation. Please refresh the page.')
        return
      }

      const exists = await verifyUser()
      if (exists) {
        setIsVerified(true)
        setIsPolling(false)
        return true
      } else {
        attempts++
        await new Promise((resolve) => setTimeout(resolve, 3000))
        return poll()
      }
    }

    return poll()
  }, [verifyUser])

  const spawnUser = async () => {
    if (!address) return

    try {
      setIsLoading(true)
      setError(null)

      if (!contract || !send) {
        setError('Failed to initialize contract. Please try again.')
        return
      }

      send()
      await startPolling()
    } catch (error) {
      console.error('Error spawning user:', error)
      setError('Failed to spawn user. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const verifyUserEffect = async () => {
      if (!address) {
        setIsVerified(false)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const exists = await verifyUser()
        setIsVerified(exists)
      } catch (error) {
        console.error('Error verifying user:', error)
        setError('Failed to verify user status.')
      } finally {
        setIsLoading(false)
      }
    }

    verifyUserEffect()
  }, [address, verifyUser])

  return { isLoading, isVerified, error, spawnUser, userStats }
}
