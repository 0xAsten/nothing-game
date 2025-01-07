use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
struct Shop {
    #[key]
    player: ContractAddress,
    item1_id: u32,
    item2_id: u32,
    item3_id: u32,
    item4_id: u32,
}
