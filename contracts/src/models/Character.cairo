use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
struct Character {
    #[key]
    player: ContractAddress,
    gold: usize,
    initialized: bool,
    attack: u32,
    defense: u32,
    health: u32,
}
