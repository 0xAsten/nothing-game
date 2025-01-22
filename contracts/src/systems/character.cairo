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
        CharacterItem::{CharacterItemRegistry, CharacterItem, Position}, Item::{Item, ItemRegistry},
        Shop::Shop, Character::Character, BackpackGrid::BackpackGrid,
    };
    use nothing_game::constants::constants::{INIT_GOLD, INIT_HEALTH, GRID_X, GRID_Y};
    use nothing_game::utils::grids::{rectangles_overlap, rectangles_adjacent};

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
                        health: INIT_HEALTH,
                    },
                );

            let mut shop: Shop = world.read_model(player);
            shop.item1_id = 24;
            world.write_model(@shop);

            self.buy_item(24, 3, 2, 0);
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
            let mut character: Character = world.read_model(player);
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

            // check if the item can be placed in the backpack
            // loop each grid of the item
            let mut cx = x;
            loop {
                if cx > xMax {
                    break;
                }
                let mut cy = y;
                loop {
                    if cy > yMax {
                        break;
                    }
                    let mut backpack_grid: BackpackGrid = world.read_model((player, cx, cy));
                    if item.item_type != 4 {
                        assert(backpack_grid.enabled == true, 'Grid is not enabled');
                        assert(backpack_grid.occupied == false, 'Grid is occupied');
                        backpack_grid.occupied = true;
                        world.write_model(@backpack_grid);
                    } else {
                        assert(backpack_grid.enabled == false, 'Grid is enabled');
                        backpack_grid.enabled = true;
                        world.write_model(@backpack_grid);
                    }
                    cy += 1;
                };
                cx += 1;
            };

            let mut character_item = CharacterItem {
                player,
                slot_id: 0,
                item_id,
                item_type: item.item_type,
                position: Position { x, y },
                rotation: rotation,
                stack_group_id: item.stack_group_id,
                effect_applied: false,
                owned: array![(x, y), (xMax, yMax)],
            };

            let mut item_registry: CharacterItemRegistry = world.read_model(player);
            let mut count = item_registry.next_slot_id;

            // Check for placement conflicts with existing items
            if character_item.item_type != 4 {
                loop {
                    if count == 0 {
                        break;
                    }

                    let mut current_character_item: CharacterItem = world
                        .read_model((player, count));
                    if current_character_item.item_id != 0
                        && current_character_item.item_type != 4 {
                        // Get corners of current item's rectangle
                        let (curr_x1, curr_y1) = *current_character_item.owned.at(0);
                        let (curr_x2, curr_y2) = *current_character_item.owned.at(1);

                        assert(
                            !rectangles_overlap(
                                x, y, xMax, yMax, curr_x1, curr_y1, curr_x2, curr_y2,
                            ),
                            'placement conflict',
                        );

                        // To apply the accessory effect, the item must be adjacent to an item
                        // with the same stack group id
                        if (character_item.item_type == 3
                            && current_character_item.item_type != 3
                            && character_item.effect_applied == false
                            && character_item
                                .stack_group_id == current_character_item
                                .stack_group_id) {
                            let adjacent = rectangles_adjacent(
                                x, y, xMax, yMax, curr_x1, curr_y1, curr_x2, curr_y2,
                            );
                            if adjacent {
                                character_item.effect_applied = true;

                                character.attack += item.attack;
                                character.defense += item.defense;
                                character.health += item.health;
                            }
                        } else if (character_item.item_type != 3
                            && current_character_item.item_type == 3
                            && current_character_item.effect_applied == false
                            && character_item
                                .stack_group_id == current_character_item
                                .stack_group_id) {
                            let adjacent = rectangles_adjacent(
                                x, y, xMax, yMax, curr_x1, curr_y1, curr_x2, curr_y2,
                            );
                            if adjacent {
                                current_character_item.effect_applied = true;

                                let current_item: Item = world
                                    .read_model(current_character_item.item_id);
                                character.attack += current_item.attack;
                                character.defense += current_item.defense;
                                character.health += current_item.health;

                                world.write_model(@current_character_item);
                            }
                        }
                    }

                    count -= 1;
                };
            }

            // put the item into inventory
            count = item_registry.next_slot_id;
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

            character.attack += item.attack;
            character.defense += item.defense;
            character.health += item.health;

            world.write_model(@character_item);
            world.write_model(@item_registry);
            world.write_model(@character);
            world.write_model(@shop);
        }

        fn remove_item(ref self: ContractState, slot_id: u32) {
            let mut world = self.world(@"nothing_game");

            let player = get_caller_address();

            let mut character_item: CharacterItem = world.read_model((player, slot_id));
            assert(character_item.item_id != 0, 'item not exists');

            let item: Item = world.read_model(character_item.item_id);

            let (x, y) = *character_item.owned.at(0);
            let (xMax, yMax) = *character_item.owned.at(1);

            let mut character: Character = world.read_model(player);
            let item_registry: CharacterItemRegistry = world.read_model(player);

            // If this is an accessory with applied effect, remove the effect
            if character_item.item_type == 3 && character_item.effect_applied {
                let item: Item = world.read_model(character_item.item_id);

                character.attack -= item.attack;
                character.defense -= item.defense;
                character.health -= item.health;
            } // If this is not an accessory find the accessories next to it and check if they have
            // the same stack group id If they do, remove the effect
            // and to make sure the accessory isn't adjacent to another armor/weapon with the same
            // stack group id
            else if character_item.item_type != 3 && character_item.item_type != 4 {
                let mut count1 = item_registry.next_slot_id;
                let mut count2 = item_registry.next_slot_id;
                loop {
                    if count1 == 0 {
                        break;
                    }

                    if count1 == slot_id {
                        count1 -= 1;
                        continue;
                    }

                    let around_character_item_1: CharacterItem = world.read_model((player, count1));
                    if around_character_item_1.item_type == 3
                        && around_character_item_1.effect_applied
                        && character_item.stack_group_id == around_character_item_1.stack_group_id {
                        let (curr_x1, curr_y1) = *around_character_item_1.owned.at(0);
                        let (curr_x2, curr_y2) = *around_character_item_1.owned.at(1);
                        let adjacent = rectangles_adjacent(
                            x, y, xMax, yMax, curr_x1, curr_y1, curr_x2, curr_y2,
                        );
                        if adjacent {
                            let mut is_adjacent = false;
                            loop {
                                if count2 == 0 {
                                    break;
                                }

                                if count2 == slot_id || count2 == count1 {
                                    count2 -= 1;
                                    continue;
                                }

                                let around_character_item_2: CharacterItem = world
                                    .read_model((player, count2));
                                if around_character_item_2.item_type != 3
                                    && around_character_item_2.item_type != 4
                                    && around_character_item_2
                                        .stack_group_id == around_character_item_1
                                        .stack_group_id {
                                    let (around_x1, around_y1) = *around_character_item_2
                                        .owned
                                        .at(0);
                                    let (around_x2, around_y2) = *around_character_item_2
                                        .owned
                                        .at(1);
                                    let adjacent = rectangles_adjacent(
                                        curr_x1,
                                        curr_y1,
                                        curr_x2,
                                        curr_y2,
                                        around_x1,
                                        around_y1,
                                        around_x2,
                                        around_y2,
                                    );
                                    if adjacent {
                                        is_adjacent = true;
                                        break;
                                    }
                                }

                                count2 -= 1;
                            };

                            if !is_adjacent {
                                let item: Item = world.read_model(around_character_item_1.item_id);
                                character.attack -= item.attack;
                                character.defense -= item.defense;
                                character.health -= item.health;
                            }
                        }
                    }

                    count1 -= 1;
                }
            }
            // If this is a bag item, disable the grids it enabled
            let mut cx = x;
            loop {
                if cx > xMax {
                    break;
                }
                let mut cy = y;
                loop {
                    if cy > yMax {
                        break;
                    }
                    let mut backpack_grid: BackpackGrid = world.read_model((player, cx, cy));
                    if character_item.item_type != 4 {
                        assert(backpack_grid.occupied == true, 'Grid is not occupied');
                        backpack_grid.occupied = false;
                        world.write_model(@backpack_grid);
                    } else {
                        assert(backpack_grid.occupied == false, 'Grid is occupied');
                        assert(backpack_grid.enabled == true, 'Grid is not enabled');
                        backpack_grid.enabled = false;
                        world.write_model(@backpack_grid);
                    }
                    cy += 1;
                };
                cx += 1;
            };

            // remove the item from inventory
            character_item.item_id = 0;
            character_item.item_type = 0;
            character_item.position = Position { x: 0, y: 0 };
            character_item.rotation = 0;
            character_item.stack_group_id = 0;
            character_item.effect_applied = false;
            character_item.owned = array![(0, 0), (0, 0)];

            character.attack -= item.attack;
            character.defense -= item.defense;
            character.health -= item.health;

            // Mark the item as removed
            character_item.item_id = 0;
            world.write_model(@character_item);
            world.write_model(@character);
        }
    }
}

