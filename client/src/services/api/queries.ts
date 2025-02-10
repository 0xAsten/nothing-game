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
