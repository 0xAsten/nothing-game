use starknet::ContractAddress;

#[starknet::interface]
trait IShop<T> {
    fn reroll_shop(ref self: T);
}

#[dojo::contract]
mod shop_system {
    use super::{IShop, ContractAddress};

    use starknet::{get_caller_address};
    use nothing_game::models::{
        CharacterItem::{CharacterItemRegistry, CharacterItem}, Item::{Item, ItemRegistry},
        Shop::Shop, Character::Character,
    };
    use nothing_game::utils::random::{pseudo_seed, random};
    use nothing_game::constants::constants::{ITEM_REGISTRY_ID, REROLL_COST};

    use dojo::model::{ModelStorage, ModelValueStorage};
    use dojo::event::EventStorage;

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    struct BuyItem {
        #[key]
        player: ContractAddress,
        item_id: u32,
        cost: u32,
        item_rarity: u8,
    }

    #[abi(embed_v0)]
    impl ShopImpl of IShop<ContractState> {
        fn reroll_shop(ref self: ContractState) {
            let mut world = self.world(@"nothing_game");

            let player = get_caller_address();

            let mut char: Character = world.read_model(player);
            assert(char.gold >= REROLL_COST, 'Not enough gold');

            let mut common: Array<u32> = ArrayTrait::new();
            let mut rare: Array<u32> = ArrayTrait::new();
            let mut legendary: Array<u32> = ArrayTrait::new();

            let itemsCounter: ItemRegistry = world.read_model(ITEM_REGISTRY_ID);
            let mut count = itemsCounter.next_item_id;

            loop {
                if count == 0 {
                    break;
                }

                let item: Item = world.read_model(count);

                match item.rarity {
                    0 => {},
                    1 => { common.append(count); },
                    2 => { rare.append(count); },
                    3 => { legendary.append(count); },
                    _ => {},
                }

                count -= 1;
            };

            assert(common.len() > 0, 'No common items found');

            let mut shop: Shop = world.read_model(player);

            let (seed1, seed2, seed3, seed4) = pseudo_seed();

            // common: 70%, rare: 20%, legendary: 10%
            let mut i = 0;
            for seed in array![seed1, seed2, seed3, seed4] {
                let mut random_index = 0;

                let itemId = if random_index < 70 {
                    random_index = random(seed, common.len());
                    *common.at(random_index)
                } else if random_index < 90 {
                    random_index = random(seed, rare.len());
                    *rare.at(random_index)
                } else {
                    random_index = random(seed, legendary.len());
                    *legendary.at(random_index)
                };

                match i {
                    0 => shop.item1_id = itemId,
                    1 => shop.item2_id = itemId,
                    2 => shop.item3_id = itemId,
                    3 => shop.item4_id = itemId,
                    _ => {},
                }

                i += 1;
            };

            char.gold -= REROLL_COST;

            world.write_model(@shop);
            world.write_model(@char);
        }
    }
}
