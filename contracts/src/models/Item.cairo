use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Item {
    #[key]
    pub item_id: u32,
    pub name: felt252,
    // Item type: 1=weapon, 2=armor, 3=accessory, 4=bag, etc.
    pub item_type: u8,
    // Base price in Gold
    pub price: u32,
    // Base stats
    pub attack: u32,
    pub defense: u32,
    pub health: u32,
    // Item dimensions
    pub width: u8,
    pub height: u8,
    // Special effect 1=attack, 2=defense, 3=health
    pub special_effect: u8,
    pub special_effect_stacks: u32,
    // Stack group ID (items with same group ID trigger stacking effects)
    pub stack_group_id: u8,
}

/// Singleton registry for managing item IDs
/// There will only be one instance of this struct with a fixed registry_id
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct ItemRegistry {
    #[key]
    registry_id: felt252,
    next_item_id: u32,
}
