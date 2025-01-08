#[cfg(test)]
mod tests {
    use dojo_cairo_test::WorldStorageTestTrait;
    use dojo::model::{ModelStorage, ModelValueStorage, ModelStorageTest};
    use dojo::world::WorldStorageTrait;
    use dojo_cairo_test::{
        spawn_test_world, NamespaceDef, TestResource, ContractDefTrait, ContractDef,
    };

    use nothing_game::systems::character::{
        character_system, ICharacterDispatcher, ICharacterDispatcherTrait,
    };
    use nothing_game::systems::item::{item_system, IItemDispatcher, IItemDispatcherTrait};
    use nothing_game::models::BackpackGrid::{BackpackGrid, m_BackpackGrid};
    use nothing_game::models::Character::{Character, m_Character};
    use nothing_game::models::Item::{Item, m_Item, ItemRegistry, m_ItemRegistry};
    use nothing_game::models::Shop::{Shop, m_Shop};
    use nothing_game::models::CharacterItem::{
        CharacterItem, m_CharacterItem, CharacterItemRegistry, m_CharacterItemRegistry,
    };

    fn namespace_def() -> NamespaceDef {
        let ndef = NamespaceDef {
            namespace: "nothing_game",
            resources: [
                TestResource::Model(m_BackpackGrid::TEST_CLASS_HASH),
                TestResource::Model(m_Character::TEST_CLASS_HASH),
                TestResource::Model(m_Item::TEST_CLASS_HASH),
                TestResource::Model(m_ItemRegistry::TEST_CLASS_HASH),
                TestResource::Model(m_Shop::TEST_CLASS_HASH),
                TestResource::Model(m_CharacterItem::TEST_CLASS_HASH),
                TestResource::Model(m_CharacterItemRegistry::TEST_CLASS_HASH),
                TestResource::Contract(character_system::TEST_CLASS_HASH),
                TestResource::Contract(item_system::TEST_CLASS_HASH),
            ]
                .span(),
        };

        ndef
    }

    fn contract_defs() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@"nothing_game", @"character_system")
                .with_writer_of([dojo::utils::bytearray_hash(@"nothing_game")].span()),
            ContractDefTrait::new(@"nothing_game", @"item_system")
                .with_writer_of([dojo::utils::bytearray_hash(@"nothing_game")].span()),
        ]
            .span()
    }

    #[test]
    fn test_spawn() {
        // let caller = starknet::contract_address_const::<0x0>();
        let ndef = namespace_def();

        let mut world = spawn_test_world([ndef].span());

        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"item_system").unwrap();
        let item_system = IItemDispatcher { contract_address };
        item_system.add_item(24, 'Magic Satchel', 4, 3, 3, 4, 100, 0, 0, 0, 0, 0, 0);

        let (contract_address, _) = world.dns(@"character_system").unwrap();
        let character_system = ICharacterDispatcher { contract_address };

        character_system.spawn();
    }
}
