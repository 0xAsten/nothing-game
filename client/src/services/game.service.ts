import { graphqlClient } from './api/client'
import {
  GET_GRID_QUERY,
  GET_SHOP_QUERY,
  GET_CHAR_ITEMS_QUERY,
} from './api/queries'

interface GridCell {
  player: string
  x: number
  y: number
  enabled: boolean
  occupied: boolean
}

interface ShopState {
  player: string
  item1_id: number
  item2_id: number
  item3_id: number
  item4_id: number
}

interface Item {
  player: string
  slot_id: number
  item_id: number
  item_type: number
  rotation: number
  position: {
    x: number
    y: number
  }
  stack_group_id: number
  effect_applied: boolean
}

interface GridResponse {
  nothingGameBackpackGridModels: {
    totalCount: number
    edges: Array<{
      node: GridCell
    }>
  }
}

interface ShopResponse {
  nothingGameShopModels: {
    totalCount: number
    edges: Array<{
      node: ShopState
    }>
  }
}

interface ItemResponse {
  nothingGameCharacterItemModels: {
    edges: Array<{
      node: Item
    }>
  }
}

export async function getPlayerGrid(address: string): Promise<GridCell[]> {
  try {
    const data = await graphqlClient.request<GridResponse>(GET_GRID_QUERY, {
      address,
    })
    return data.nothingGameBackpackGridModels.edges.map((edge) => edge.node)
  } catch (error) {
    console.error('Error fetching grid:', error)
    return []
  }
}

export async function getPlayerShop(
  address: string,
): Promise<ShopState | null> {
  try {
    const data = await graphqlClient.request<ShopResponse>(GET_SHOP_QUERY, {
      address,
    })
    return data.nothingGameShopModels.edges[0]?.node || null
  } catch (error) {
    console.error('Error fetching shop:', error)
    return null
  }
}

export async function getPlayerItems(address: string): Promise<Item[]> {
  try {
    const data = await graphqlClient.request<ItemResponse>(
      GET_CHAR_ITEMS_QUERY,
      {
        address,
      },
    )
    return data.nothingGameCharacterItemModels.edges.map((edge) => edge.node)
  } catch (error) {
    console.error('Error fetching items:', error)
    return []
  }
}
