import { GraphQLClient } from 'graphql-request'
import { createClient } from 'graphql-ws'

const API_URL = 'https://api.cartridge.gg/x/nothing-game/torii/graphql'

export const graphqlClient = new GraphQLClient(API_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
})

export const wsClient = createClient({
  url: 'wss://api.cartridge.gg/x/nothing-game/torii/graphql',
})
