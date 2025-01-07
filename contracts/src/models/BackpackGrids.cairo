use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
struct BackpackGrid {
    #[key]
    player: ContractAddress,
    #[key]
    x: usize,
    #[key]
    y: u8,
    enabled: bool,
    occupied: bool,
    slot_id: u32,
    item_id: u32,
    stack_group_id: u8,
}
