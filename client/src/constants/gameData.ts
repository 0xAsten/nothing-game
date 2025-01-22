import { Item, ItemType, SpecialEffect } from '@/types/game'

export const GRID_WIDTH = 9
export const GRID_HEIGHT = 7
export const INITIAL_GOLD = 300
export const REROLL_COST = 10

export const INITIAL_PLAYER_STATS = {
  gold: INITIAL_GOLD,
  health: 100,
  attack: 20,
  defense: 30,
}

export const SAMPLE_ITEMS: Item[] = [
  {
    item_id: 1,
    name: 'Rusty Sword',
    item_type: ItemType.WEAPON,
    rarity: 1,
    width: 1,
    height: 2,
    price: 50,
    attack: 10,
    defense: 0,
    health: 0,
    special_effect: SpecialEffect.NONE,
    special_effect_stacks: 0,
    stack_group_id: 1,
    image_url: '/items/rusty-sword.png',
  },
  {
    item_id: 2,
    name: 'Leather Armor',
    item_type: ItemType.ARMOR,
    rarity: 1,
    width: 2,
    height: 2,
    price: 75,
    attack: 0,
    defense: 15,
    health: 20,
    special_effect: SpecialEffect.NONE,
    special_effect_stacks: 0,
    stack_group_id: 1,
    image_url: '/items/leather-armor.png',
  },
  {
    item_id: 3,
    name: 'Small Pouch',
    item_type: ItemType.BAG,
    rarity: 1,
    width: 2,
    height: 2,
    price: 100,
    attack: 0,
    defense: 0,
    health: 0,
    special_effect: SpecialEffect.NONE,
    special_effect_stacks: 0,
    stack_group_id: 0,
    image_url: '/items/small-pouch.png',
  },
  {
    item_id: 4,
    name: 'Warrior Ring',
    item_type: ItemType.ACCESSORY,
    rarity: 2,
    width: 1,
    height: 1,
    price: 150,
    attack: 0,
    defense: 0,
    health: 0,
    special_effect: SpecialEffect.ATTACK,
    special_effect_stacks: 5,
    stack_group_id: 1,
    image_url: '/items/warrior-ring.png',
  },
]
