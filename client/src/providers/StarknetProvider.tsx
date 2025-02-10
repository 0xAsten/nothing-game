'use client'

import { sepolia, mainnet, Chain } from '@starknet-react/chains'
import {
  StarknetConfig,
  jsonRpcProvider,
  starkscan,
} from '@starknet-react/core'
import ControllerConnector from '@cartridge/connector/controller'
import { SessionPolicies } from '@cartridge/controller'
import { constants } from 'starknet'
import { CHARACTER_SYSTEM, SHOP_SYSTEM } from '../config/contracts'

// Define your contract addresses
const ETH_TOKEN_ADDRESS =
  '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'

// Define session policies
const policies: SessionPolicies = {
  contracts: {
    [CHARACTER_SYSTEM!.address]: {
      methods: [
        {
          name: 'spawn',
          entrypoint: 'spawn',
        },
        {
          name: 'buy_item',
          entrypoint: 'buy_item',
        },
        {
          name: 'remove_item',
          entrypoint: 'remove_item',
        },
        {
          name: 'upgrade',
          entrypoint: 'upgrade',
        },
      ],
    },
    [SHOP_SYSTEM!.address]: {
      methods: [
        {
          name: 'reroll_shop',
          entrypoint: 'reroll_shop',
        },
      ],
    },
  },
}

// Initialize the connector
const connector = new ControllerConnector({
  policies,
  defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
  chains: [{ rpcUrl: sepolia.rpcUrls.cartridge.http[0] }],
})

// Configure RPC provider
const provider = jsonRpcProvider({
  rpc: (chain: Chain) => {
    switch (chain) {
      case mainnet:
        return { nodeUrl: 'https://api.cartridge.gg/x/starknet/mainnet' }
      case sepolia:
      default:
        return { nodeUrl: 'https://api.cartridge.gg/x/starknet/sepolia' }
    }
  },
})

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  return (
    <StarknetConfig
      autoConnect
      chains={[mainnet, sepolia]}
      provider={provider}
      connectors={[connector]}
      explorer={starkscan}
    >
      {children}
    </StarknetConfig>
  )
}
