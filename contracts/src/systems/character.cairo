#[starknet::interface]
trait ICharacter<T> {
    fn spawn(ref self: T);
    fn buy_item(ref self: T, item_id: u32, x: u8, y: u8, rotation: u8);
    fn remove_item(ref self: T, slot_id: u32);
}

#[dojo::contract]
mod character_system {
    use super::ICharacter;

    use starknet::{get_caller_address};

    use nothing_game::models::{
        CharacterItem::{CharacterItemRegistry, CharacterItem}, Item::{Item, ItemRegistry},
        Shop::Shop, BackpackGrid::BackpackGrid,
    };
    use nothing_game::constants::constants::{INIT_GOLD};

    use dojo::model::{ModelStorage, ModelValueStorage};

    #[abi(embed_v0)]
    impl CharacterImpl of ICharacter<ContractState> {
        fn spawn(ref self: ContractState) {
            let mut world = self.world(@"nothing_game");

            let player = get_caller_address();

            let character: Character = world.read_model(player);
            assert(character.initialized == false, 'character already initialized');

            world
                .write_model(
                    @Character {
                        player,
                        gold: INIT_GOLD,
                        initialized: true,
                        attack: 0,
                        defense: 0,
                        health: 0,
                    },
                );

            // Default the player has 2 bags
            // Must add two bag items when setup the game
            let item: Item = world.read_model(Backpack::id);
            assert(item.itemType == 4, 'Invalid item type');
            let item: Item = world.read_model(Pack::id);
            assert(item.itemType == 4, 'Invalid item type');

            world.write_model(@CharacterItemStorage { player, id: 1, itemId: Backpack::id });
            world.write_model(@CharacterItemStorage { player, id: 2, itemId: Pack::id });
            world.write_model(@CharacterItemsStorageCounter { player, count: 2 });
        }

        fn buy_item(ref self: ContractState, item_id: u32, x: u8, y: u8, rotation: u8) {
            let mut world = self.world(@"nothing_game");

            let player = get_caller_address();

            // Check if the item exists
            let item: Item = world.read_model(item_id);
            assert(item.name != '', 'item not exists');

            // Check if the item is on sale
            assert(item_id != 0, 'invalid item_id');
            let mut shop: Shop = world.read_model(player);
            if (shop.item1_id == item_id) {
                shop.item1_id = 0
            } else if (shop.item2_id == item_id) {
                shop.item2_id = 0
            } else if (shop.item3_id == item_id) {
                shop.item3_id = 0
            } else if (shop.item4_id == item_id) {
                shop.item4_id = 0
            } else {
                assert(false, 'item not on sale');
            }

            // Check if the player has enough gold
            let mut character: Characters = world.read_model(player);
            assert(character.gold >= item.price, 'not enough gold');
            character.gold -= item.price;

            // Check if the item can be placed in the player's inventory
            let mut xMax = 0;
            let mut yMax = 0;

            if rotation == 0 || rotation == 2 {
                // only check grids which are above the starting (x,y)
                xMax = x + item.width - 1;
                yMax = y + item.height - 1;
            } else if rotation == 1 || rotation == 3 {
                // only check grids which are to the right of the starting (x,y)
                //item_h becomes item_w and vice versa
                xMax = x + item.height - 1;
                yMax = y + item.width - 1;
            } else {
                assert(false, 'invalid rotation');
            }

            assert(xMax < GRID_X, 'item out of bound for x');
            assert(yMax < GRID_Y, 'item out of bound for y');

            // put the item into inventory
            let mut item_registry: CharacterItemRegistry = world.read_model(player);
            let mut count = item_registry.next_slot_id;

            let mut character_item = CharacterItem {
                player,
                slot_id: 0,
                item_id,
                position: Position { x, y },
                rotation: rotation,
                effect_applied: false,
            };

            loop {
                if count == 0 {
                    break;
                }

                let current_character_item: CharacterItem = world.read_model((player, count));
                if current_character_item.item_id == 0 {
                    character_item.slot_id = count;
                    break;
                }

                count -= 1;
            };

            if count == 0 {
                item_registry.next_slot_id += 1;
                character_item.slot_id = item_registry.next_slot_id;
            }

            // put the item into backpack
            let mut i = x;
            let mut j = y;
            loop {
                if i > xMax {
                    break;
                }
                loop {
                    if j > yMax {
                        break;
                    }

                    let grid: BackpackGrid = world.read_model((player, i, j));
                    if item.item_type == 4 {
                        assert(!grid.enabled, 'Already has a bag');
                        world
                            .write_model(
                                @BackpackGrid {
                                    player: player,
                                    x: i,
                                    y: j,
                                    enabled: true,
                                    occupied: false,
                                    slot_id: 0,
                                    item_id: 0,
                                    stack_group_id: 0,
                                },
                            );
                    } else {
                        assert(grid.enabled, 'Dont have a bag');
                        assert(!grid.occupied, 'Already occupied');
                        // stack_group_id of a grid is the same as the item's stack_group_id if the
                        // item is not an accessory
                        let stack_group_id = if item.item_type != 3 {
                            // apply stacking effect
                            character.attack += item.attack;
                            character.defense += item.defense;
                            character.health += item.health;
                            item.stack_group_id
                        } else {
                            0
                        };
                        world
                            .write_model(
                                @BackpackGrid {
                                    player: player,
                                    x: i,
                                    y: j,
                                    enabled: true,
                                    occupied: true,
                                    slot_id: character_item.slot_id,
                                    item_id: item_id,
                                    stack_group_id: stack_group_id,
                                },
                            );

                        // apply effect if the item is an accessory
                        if !character_item.effect_applied && item.item_type == 3 {
                            // left
                            if i > 0 && i == x && !character_item.effect_applied {
                                let grid: BackpackGrid = world.read_model((player, i - 1, j));
                                if grid.stack_group_id == item.stack_group_id {
                                    character_item.effect_applied = true;
                                }
                            }
                            // top
                            if j < GRID_Y - 1 && j == yMax && !character_item.effect_applied {
                                let grid: BackpackGrid = world.read_model((player, i, j + 1));
                                if grid.stack_group_id == item.stack_group_id {
                                    character_item.effect_applied = true;
                                }
                            }
                            // right
                            if i < GRID_X - 1 && i == xMax && !character_item.effect_applied {
                                let grid: BackpackGrid = world.read_model((player, i + 1, j));
                                if grid.stack_group_id == item.stack_group_id {
                                    character_item.effect_applied = true;
                                }
                            }
                            // bottom
                            if j > 0 && j == y && !character_item.effect_applied {
                                let grid: BackpackGrid = world.read_model((player, i, j - 1));
                                if grid.stack_group_id == item.stack_group_id {
                                    character_item.effect_applied = true;
                                }
                            }
                            // apply effect
                            if character_item.effect_applied {
                                match item.special_effect {
                                    0 => assert(false, 'invalid special effect'),
                                    1 => character.attack += item.special_effect_stacks,
                                    2 => character.defense += item.special_effect_stacks,
                                    3 => character.health += item.special_effect_stacks,
                                    _ => assert(false, 'invalid special effect'),
                                }
                            }
                        }
                    }

                    j += 1;
                };
                j = y;
                i += 1;
            };

            world.write_model(@character_item);
            world.write_model(@item_registry);
            world.write_model(@character);
            world.write_model(@shop);
        }

        fn remove_item(ref self: ContractState, slot_id: u32) {
            let mut world = self.world(@"nothing_game");

            let player = get_caller_address();

            let mut character: Characters = world.read_model(player);

            let mut character_item: CharacterItem = world.read_model((player, slot_id));
            assert(character_item.item_id != 0, 'item not exists');

            let item: Item = world.read_model(character_item.item_id);

            // remove the item from backpack
            let mut xMax = 0;
            let mut yMax = 0;

            if character_item.rotation == 0 || character_item.rotation == 2 {
                // only check grids which are above the starting (x,y)
                xMax = character_item.position.x + item.width - 1;
                yMax = character_item.position.y + item.height - 1;
            } else if character_item.rotation == 1 || character_item.rotation == 3 {
                // only check grids which are to the right of the starting (x,y)
                //item_h becomes item_w and vice versa
                xMax = character_item.position.x + item.height - 1;
                yMax = character_item.position.y + item.width - 1;
            } else {
                assert(false, 'invalid rotation');
            }

            let mut i = character_item.position.x;
            let mut j = character_item.position.y;
            loop {
                if i > xMax {
                    break;
                }
                loop {
                    if j > yMax {
                        break;
                    }

                    let grid: BackpackGrid = world.read_model((player, i, j));
                    if item.item_type == 4 {
                        assert(!grid.occupied, 'Bag is used');
                        grid.enabled = false;
                        grid.stack_group_id = 0;
                        world.write_model(@grid);
                    } else {
                        assert(grid.occupied, 'No item');
                        assert(grid.item_id == character_item.item_id, 'Item id mismatch');
                        assert(grid.slot_id == character_item.slot_id, 'Slot id mismatch');

                        grid.occupied = false;
                        grid.slot_id = 0;
                        grid.item_id = 0;
                        grid.stack_group_id = 0;
                        world.write_model(@grid);
                    }
                }
            }

            // unapply effect
            if item.item_type == 3 {
                match item.special_effect {
                    0 => assert(false, 'invalid special effect'),
                    1 => character.attack -= item.special_effect_stacks,
                    2 => character.defense -= item.special_effect_stacks,
                    3 => character.health -= item.special_effect_stacks,
                    _ => assert(false, 'invalid special effect'),
                }
            } else if item.item_type != 4 {
                character.attack -= item.attack;
                character.defense -= item.defense;
                character.health -= item.health;
            }

            // remove the item from inventory
            character_item.item_id = 0;
            character_item.position = Position { x: 0, y: 0 };
            character_item.rotation = 0;
            character_item.effect_applied = false;

            world.write_model(@character_item);
            world.write_model(@character);
        }
    }
}

