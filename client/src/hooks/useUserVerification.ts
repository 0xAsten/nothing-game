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
import { subscribeToUserStats } from '../services/subscriptions'

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
  const [userStats, setUserStats] = useState<any | null>(null)

  const { contract } = useContract({
    abi: CHARACTER_SYSTEM!.abi,
    address: CHARACTER_SYSTEM!.address as `0x${string}`,
  })

  const { send } = useSendTransaction({
    calls: contract ? [contract.populate('spawn', [])] : undefined,
  })

  useEffect(() => {
    if (!address) return

    // Initial fetch of user stats
    const fetchInitialStats = async () => {
      try {
        const stats = await getUserStats(address)
        if (stats) {
          setUserStats({
            gold: stats.gold,
            health: stats.health,
            attack: stats.attack,
            defense: stats.defense,
          })
          setIsVerified(stats.initialized)
        }
      } catch (error) {
        console.error('Error fetching initial user stats:', error)
        setError('Failed to get user stats')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialStats()

    // Set up subscription for real-time updates
    const unsubscribe = subscribeToUserStats(address, {
      onData: (stats) => {
        if (stats) {
          setUserStats({
            gold: stats.gold,
            health: stats.health,
            attack: stats.attack,
            defense: stats.defense,
            initialized: stats.initialized,
          })
          setIsVerified(stats.initialized)
          setIsLoading(false)
        }
      },
      onError: (error) => {
        console.error('User stats subscription error:', error)
        setError('Failed to get user updates')
        setIsLoading(false)
      },
    })

    return () => {
      unsubscribe()
    }
  }, [address])

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
    } catch (error) {
      console.error('Error spawning user:', error)
      setError('Failed to spawn user. Please try again.')
      setIsLoading(false)
    }
  }

  return { isLoading, isVerified, error, spawnUser, userStats }
}
