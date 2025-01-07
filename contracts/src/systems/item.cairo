#[starknet::interface]
trait IItem<T> {
    fn add_item(
        ref self: T,
        item_id: u32,
        name: felt252,
        item_type: u8,
        rarity: u8,
        width: u8,
        height: u8,
        price: u32,
        attack: u32,
        defense: u32,
        health: u32,
        special_effect: u8,
        special_effect_stacks: u32,
        stack_group_id: u8,
    );
}

#[dojo::contract]
mod item_system {
    use super::IItem;

    use starknet::{get_caller_address};

    use nothing_game::models::{Item::{Item, ItemRegistry}};
    use nothing_game::constants::constants::{GRID_X, GRID_Y, ITEM_REGISTRY_ID};

    use dojo::model::{ModelStorage, ModelValueStorage};

    #[abi(embed_v0)]
    impl ItemImpl of IItem<ContractState> {
        fn add_item(
            ref self: ContractState,
            item_id: u32,
            name: felt252,
            item_type: u8,
            rarity: u8,
            width: u8,
            height: u8,
            price: u32,
            attack: u32,
            defense: u32,
            health: u32,
            special_effect: u8,
            special_effect_stacks: u32,
            stack_group_id: u8,
        ) {
            let mut world = self.world(@"nothing_game");

            let admin = get_caller_address();
            assert(world.dispatcher.is_owner(0, admin), 'admin not world owner');

            assert(width > 0 && width <= GRID_X, 'width not in range');
            assert(height > 0 && height <= GRID_Y, 'height not in range');

            assert(price > 0, 'price must be greater than 0');

            let item_registry: ItemRegistry = world.read_model(ITEM_REGISTRY_ID);
            if item_id > item_registry.next_item_id {
                world
                    .write_model(
                        @ItemRegistry { registry_id: ITEM_REGISTRY_ID, next_item_id: item_id },
                    )
            }

            let item = Item {
                item_id,
                name,
                item_type,
                rarity,
                width,
                height,
                price,
                attack,
                defense,
                health,
                special_effect,
                special_effect_stacks,
                stack_group_id,
            };

            world.write_model(@item);
        }
    }
}
