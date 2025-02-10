import { GraphQLClient } from 'graphql-request'

const API_URL = 'https://api.cartridge.gg/x/nothing-game/torii/graphql'

export const graphqlClient = new GraphQLClient(API_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
})
