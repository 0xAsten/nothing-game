import { CHECK_USER_QUERY } from './api/queries'
import { graphqlClient } from './api/client'

interface CharacterModel {
  player: string
  gold: number
  initialized: boolean
  attack: number
  defense: number
  health: number
}

interface CharacterModelsResponse {
  nothingGameCharacterModels: {
    edges: Array<{
      node: CharacterModel
    }>
  }
}

export async function getUserStats(
  address: string,
): Promise<CharacterModel | null> {
  try {
    const data = await graphqlClient.request<CharacterModelsResponse>(
      CHECK_USER_QUERY,
      { address },
    )
    return data.nothingGameCharacterModels.edges[0]?.node || null
  } catch (error) {
    console.error('Error checking user:', error)
    return null
  }
}
