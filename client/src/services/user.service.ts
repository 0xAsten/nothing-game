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

export async function checkUserExists(address: string): Promise<boolean> {
  try {
    const data = await graphqlClient.request<CharacterModelsResponse>(
      CHECK_USER_QUERY,
      { address },
    )
    console.log(data)
    return data.nothingGameCharacterModels.edges.length > 0
  } catch (error) {
    console.error('Error checking user:', error)
    return false
  }
}
