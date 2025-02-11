import { ShopData } from '@/types/game'
import { SHOP_SUBSCRIPTION } from './api/queries'
import { wsClient } from './api/client'

interface SubscriptionCallbacks {
  onData: (data: ShopData | null) => void
  onError: (error: Error) => void
}

export function subscribeToShopUpdates(
  address: string,
  callbacks: SubscriptionCallbacks,
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
            model?.player?.toLowerCase() === address.toLowerCase(),
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
