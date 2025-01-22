export enum ItemType {
  WEAPON = 1,
  ARMOR = 2,
  ACCESSORY = 3,
  BAG = 4
}

export enum SpecialEffect {
  NONE = 0,
  ATTACK = 1,
  DEFENSE = 2,
  HEALTH = 3
}

export interface Item {
  item_id: number;
  name: string;
  item_type: ItemType;
  rarity: number;
  width: number;
  height: number;
  price: number;
  attack: number;
  defense: number;
  health: number;
  special_effect: SpecialEffect;
  special_effect_stacks: number;
  stack_group_id: number;
  image_url?: string;
}

export interface PlayerStats {
  gold: number;
  health: number;
  attack: number;
  defense: number;
}

export interface GridPosition {
  x: number;
  y: number;
}

export interface PlacedItem extends Item {
  position: GridPosition;
  rotation: 0 | 90 | 180 | 270;
}

export interface GameState {
  playerStats: PlayerStats;
  inventory: PlacedItem[];
  shopItems: Item[];
}
