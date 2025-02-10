import manifestRelease from '../../public/manifest_release.json'
import type { Abi } from 'starknet'

interface ContractConfig {
  address: string
  abi: Abi
  tag: string
  selector: string
  systems: string[]
}

interface ModelConfig {
  class_hash: string
  tag: string
  selector: string
}

// Helper function to find contract by tag
const findContractByTag = (tag: string): ContractConfig | undefined => {
  return manifestRelease.contracts.find((contract) => contract.tag === tag)
}

// Helper function to find model by tag
const findModelByTag = (tag: string): ModelConfig | undefined => {
  return manifestRelease.models.find((model) => model.tag === tag)
}

// Character System Contract
export const CHARACTER_SYSTEM = findContractByTag(
  'nothing_game-character_system',
)
if (!CHARACTER_SYSTEM) {
  throw new Error('Character system contract not found in manifest')
}

// Item System Contract
export const ITEM_SYSTEM = findContractByTag('nothing_game-item_system')
if (!ITEM_SYSTEM) {
  throw new Error('Item system contract not found in manifest')
}

// Shop System Contract
export const SHOP_SYSTEM = findContractByTag('nothing_game-shop_system')
if (!SHOP_SYSTEM) {
  throw new Error('Shop system contract not found in manifest')
}

// Models
export const MODELS = {
  CHARACTER: findModelByTag('nothing_game-Character'),
  BACKPACK_GRID: findModelByTag('nothing_game-BackpackGrid'),
  CHARACTER_ITEM: findModelByTag('nothing_game-CharacterItem'),
  CHARACTER_ITEM_REGISTRY: findModelByTag('nothing_game-CharacterItemRegistry'),
  ITEM: findModelByTag('nothing_game-Item'),
  ITEM_REGISTRY: findModelByTag('nothing_game-ItemRegistry'),
  SHOP: findModelByTag('nothing_game-Shop'),
} as const

// World Config
export const WORLD = {
  address: manifestRelease.world.address,
  classHash: manifestRelease.world.class_hash,
} as const
