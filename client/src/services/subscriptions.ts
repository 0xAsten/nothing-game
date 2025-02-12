import { ShopData } from '@/types/game'
import { SHOP_SUBSCRIPTION } from './api/queries'
import { wsClient } from './api/client'
import { USER_STATS_SUBSCRIPTION } from './api/queries'
import { PlayerStats } from '@/types/game'

interface ShopCallbacks {
  onData: (data: ShopData | null) => void
  onError: (error: Error) => void
}

interface UserStatsCallbacks {
  onData: (data: PlayerStats | null) => void
  onError: (error: Error) => void
}

export function subscribeToShopUpdates(
  address: string,
  callbacks: ShopCallbacks,
) {
  return wsClient.subscribe(
    {
      query: SHOP_SUBSCRIPTION,
      variables: { address },
    },
    {
      next: (data: any) => {
        const shopData = data.data?.entityUpdated?.models?.find(
          (model: any) =>
            model?.player?.toLowerCase().replace(/^0x0+/, '0x') ===
            address.toLowerCase().replace(/^0x0+/, '0x'),
        )
        callbacks.onData(shopData || null)
      },
      error: (error: Error) => {
        console.error('Subscription error:', error)
        callbacks.onError(error)
      },
      complete: () => {
        console.log('Subscription completed')
      },
    },
  )
}

export function subscribeToUserStats(
  address: string,
  callbacks: UserStatsCallbacks,
) {
  return wsClient.subscribe(
    {
      query: USER_STATS_SUBSCRIPTION,
      variables: { address },
    },
    {
      next: (data: any) => {
        const userStats = data.data?.entityUpdated?.models?.find(
          (model: any) =>
            model?.player?.toLowerCase().replace(/^0x0+/, '0x') ===
            address.toLowerCase().replace(/^0x0+/, '0x'),
        )
        console.log('user stats data updated:', userStats)
        callbacks.onData(userStats || null)
      },
      error: (error: Error) => {
        console.error('Subscription error:', error)
        callbacks.onError(error)
      },
      complete: () => {
        console.log('Subscription completed')
      },
    },
  )
}
