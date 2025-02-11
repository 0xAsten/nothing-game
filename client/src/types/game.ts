export enum ItemType {
  WEAPON = 1,
  ARMOR = 2,
  ACCESSORY = 3,
  BAG = 4,
}

export enum SpecialEffect {
  NONE = 0,
  ATTACK = 1,
  DEFENSE = 2,
  HEALTH = 3,
}

export enum StackGroup {
  NONE = 0,
  WARRIOR = 1,
  RANGER = 2,
  MAGE = 3,
  KNIGHT = 4,
  ASSASSIN = 5,
}

export interface Item {
  item_id: number
  name: string
  item_type: ItemType
  rarity: number
  width: number
  height: number
  price: number
  attack: number
  defense: number
  health: number
  special_effect: SpecialEffect
  special_effect_stacks: number
  stack_group_id: number
  image_url?: string
}

export interface PlayerStats {
  gold: number
  health: number
  attack: number
  defense: number
}

export interface GridPosition {
  x: number
  y: number
}

export interface PlacedItem extends Item {
  id: number
  position: GridPosition
  rotation: 0 | 90 | 180 | 270
  isValid?: boolean
}

export interface GameState {
  playerStats: PlayerStats
  inventory: PlacedItem[]
  inventoryCount: number
  shopItems: Item[]
  selectedItem?: Item
  selectedItemIndex?: number
  previewPosition?: GridPosition
  previewRotation?: 0 | 90 | 180 | 270
}

export interface CellValidation {
  isOccupied: boolean
  isWithinBag: boolean
  occupyingItem?: PlacedItem
}

export interface ValidationResult {
  isValid: boolean
  reason?: string
}

export interface ShopData {
  item1_id: number
  item2_id: number
  item3_id: number
  item4_id: number
}
