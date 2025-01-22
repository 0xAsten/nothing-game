import {
  Item,
  ItemType,
  PlacedItem,
  GridPosition,
  ValidationResult,
  CellValidation,
  SpecialEffect,
  PlayerStats,
} from '@/types/game'
import { GRID_WIDTH, GRID_HEIGHT } from '@/constants/gameData'

// Get dimensions of an item based on its rotation
export const getRotatedDimensions = (
  item: Item,
  rotation: number,
): { width: number; height: number } => {
  if (rotation === 90 || rotation === 270) {
    return { width: item.height, height: item.width }
  }
  return { width: item.width, height: item.height }
}

// Check if a position is within grid boundaries
export const isWithinBounds = (
  position: GridPosition,
  width: number,
  height: number,
): boolean => {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + width <= GRID_WIDTH &&
    position.y + height <= GRID_HEIGHT
  )
}

// Get all cells that an item would occupy at a given position and rotation
export const getOccupiedCells = (
  item: Item,
  position: GridPosition,
  rotation: number,
): GridPosition[] => {
  const { width, height } = getRotatedDimensions(item, rotation)
  const cells: GridPosition[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({ x: position.x + x, y: position.y + y })
    }
  }

  return cells
}

// Check if a cell is covered by a bag
export const isCellCoveredByBag = (
  position: GridPosition,
  inventory: PlacedItem[],
): boolean => {
  const bags = inventory.filter((item) => item.item_type === ItemType.BAG)

  return bags.some((bag) => {
    const occupiedCells = getOccupiedCells(bag, bag.position, bag.rotation)
    return occupiedCells.some(
      (cell) => cell.x === position.x && cell.y === position.y,
    )
  })
}

// Validate item placement
export const validatePlacement = (
  item: Item,
  position: GridPosition,
  rotation: number,
  inventory: PlacedItem[],
): ValidationResult => {
  const { width, height } = getRotatedDimensions(item, rotation)

  // Check boundaries
  if (!isWithinBounds(position, width, height)) {
    return { isValid: false, reason: 'Out of bounds' }
  }

  const occupiedCells = getOccupiedCells(item, position, rotation)

  // For bags
  if (item.item_type === ItemType.BAG) {
    // Check overlap with other bags
    const hasOverlap = inventory
      .filter((invItem) => invItem.item_type === ItemType.BAG)
      .some((bag) => {
        const bagCells = getOccupiedCells(bag, bag.position, bag.rotation)
        return bagCells.some((bagCell) =>
          occupiedCells.some(
            (cell) => cell.x === bagCell.x && cell.y === bagCell.y,
          ),
        )
      })

    if (hasOverlap) {
      return { isValid: false, reason: 'Bags cannot overlap' }
    }
  } else {
    // For non-bag items
    // Check if all cells are covered by bags
    const allCellsCovered = occupiedCells.every((cell) =>
      isCellCoveredByBag(cell, inventory),
    )
    if (!allCellsCovered) {
      return { isValid: false, reason: 'Must be placed within a bag' }
    }

    // Check overlap with other items
    const hasOverlap = inventory
      .filter((invItem) => invItem.item_type !== ItemType.BAG)
      .some((invItem) => {
        const itemCells = getOccupiedCells(
          invItem,
          invItem.position,
          invItem.rotation,
        )
        return itemCells.some((itemCell) =>
          occupiedCells.some(
            (cell) => cell.x === itemCell.x && cell.y === itemCell.y,
          ),
        )
      })

    if (hasOverlap) {
      return { isValid: false, reason: 'Items cannot overlap' }
    }
  }

  return { isValid: true }
}

// Get adjacent cells for special effects
export const getAdjacentCells = (position: GridPosition): GridPosition[] => {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ]

  return directions
    .map(([dx, dy]) => ({
      x: position.x + dx,
      y: position.y + dy,
    }))
    .filter((pos) => isWithinBounds(pos, 1, 1))
}

// Calculate special effects
export const calculateSpecialEffects = (
  inventory: PlacedItem[],
): PlayerStats => {
  const effects: PlayerStats = {
    gold: 0,
    attack: 0,
    defense: 0,
    health: 0,
  }

  const accessories = inventory.filter(
    (item) => item.item_type === ItemType.ACCESSORY,
  )

  accessories.forEach((accessory) => {
    const accessoryCells = getOccupiedCells(
      accessory,
      accessory.position,
      accessory.rotation,
    )
    const adjacentCells = accessoryCells.flatMap(getAdjacentCells)

    const adjacentItems = inventory.filter((item) => {
      if (
        item.item_type !== ItemType.WEAPON &&
        item.item_type !== ItemType.ARMOR
      )
        return false
      if (item.stack_group_id !== accessory.stack_group_id) return false

      const itemCells = getOccupiedCells(item, item.position, item.rotation)
      return itemCells.some((itemCell) =>
        adjacentCells.some(
          (adjCell) => adjCell.x === itemCell.x && adjCell.y === itemCell.y,
        ),
      )
    })

    if (adjacentItems.length > 0) {
      switch (accessory.special_effect) {
        case SpecialEffect.ATTACK:
          effects.attack += accessory.special_effect_stacks
          break
        case SpecialEffect.DEFENSE:
          effects.defense += accessory.special_effect_stacks
          break
        case SpecialEffect.HEALTH:
          effects.health += accessory.special_effect_stacks
          break
      }
    }
  })

  return effects
}
