use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
struct BackpackGrid {
    #[key]
    player: ContractAddress,
    #[key]
    x: u8,
    #[key]
    y: u8,
    enabled: bool,
    occupied: bool,
}
