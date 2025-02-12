import { gql } from 'graphql-request'

export const CHECK_USER_QUERY = gql`
  query NothingGameCharacterModels($address: String!) {
    nothingGameCharacterModels(where: { playerEQ: $address }) {
      edges {
        node {
          player
          gold
          initialized
          attack
          defense
          health
        }
      }
    }
  }
`

export const GET_GRID_QUERY = gql`
  query NothingGameBackpackGridModels($address: String!) {
    nothingGameBackpackGridModels(where: { playerEQ: $address }) {
      totalCount
      edges {
        node {
          player
          x
          y
          enabled
          occupied
        }
      }
    }
  }
`

export const GET_SHOP_QUERY = gql`
  query NothingGameShopModels($address: String!) {
    nothingGameShopModels(where: { playerEQ: $address }) {
      totalCount
      edges {
        node {
          player
          item1_id
          item2_id
          item3_id
          item4_id
        }
      }
    }
  }
`

export const GET_CHAR_ITEM_REGISTRY_QUERY = gql`
  query NothingGameCharacterItemRegistryModels($address: String!) {
    nothingGameCharacterItemRegistryModels(where: { playerEQ: $address }) {
      edges {
        node {
          player
          next_slot_id
        }
      }
    }
  }
`

export const GET_CHAR_ITEMS_QUERY = gql`
  query NothingGameCharacterItemModels($address: String!) {
    nothingGameCharacterItemModels(
      where: { playerEQ: $address, item_idNEQ: 0 }
    ) {
      edges {
        node {
          player
          slot_id
          item_id
          item_type
          position {
            x
            y
          }
          rotation
          stack_group_id
          effect_applied
        }
      }
    }
  }
`

export const SHOP_SUBSCRIPTION = gql`
  subscription EntityUpdated {
    entityUpdated {
      models {
        ... on nothing_game_Shop {
          player
          item1_id
          item2_id
          item3_id
          item4_id
        }
      }
    }
  }
`

export const USER_STATS_SUBSCRIPTION = gql`
  subscription EntityUpdated {
    entityUpdated {
      models {
        ... on nothing_game_Character {
          player
          gold
          initialized
          attack
          defense
          health
        }
      }
    }
  }
`
