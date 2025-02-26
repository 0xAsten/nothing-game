use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, Debug, Introspect)]
struct Position {
    x: u8,
    y: u8,
}

#[derive(Drop, Serde, Debug)]
#[dojo::model]
struct CharacterItem {
    #[key]
    player: ContractAddress,
    #[key]
    slot_id: u32,
    item_id: u32,
    item_type: u8,
    position: Position,
    // 0=0, 1=90, 2=180, 3=270
    rotation: u8,
    stack_group_id: u8,
    effect_applied: bool,
    owned: Array<(u8, u8)>,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
struct CharacterItemRegistry {
    #[key]
    player: ContractAddress,
    next_slot_id: u32,
}
