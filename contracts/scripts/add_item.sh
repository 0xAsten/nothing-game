#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

# Add parameter handling for environment
ENV=${1:-dev}  # Default to 'dev' if no argument provided
MANIFEST_FILE="./manifest_${ENV}.json"

if [[ ! -f "$MANIFEST_FILE" ]]; then
    echo "Error: Manifest file $MANIFEST_FILE does not exist"
    exit 1
fi

: "${STARKNET_RPC_URL:?Environment variable STARKNET_RPC_URL must be set}"

export WORLD_ADDRESS=$(cat $MANIFEST_FILE | jq -r '.world.address')
export ITEM_STSTEM_ADDRESS=$(cat $MANIFEST_FILE | jq -r '.contracts[] | select(.tag == "nothing_game-item_system").address')

echo "---------------------------------------------------------------------------"
echo "Environment: $ENV"
echo "Using manifest: $MANIFEST_FILE"
echo "World: $WORLD_ADDRESS"
echo "Item system: $ITEM_STSTEM_ADDRESS"
echo "---------------------------------------------------------------------------"

# Generated item commands
# Rusty Sword 0x52757374792053776f7264
# Battle Axe 0x426174746c6520417865
# War Hammer 0x5761722048616d6d6572
# Holy Blade 0x486f6c7920426c616465
# Short Bow 0x53686f727420426f77
# Twin Daggers 0x5477696e2044616767657273
# Crystal Staff 0x4372797374616c205374616666
# Leather Armor 0x4c6561746865722041726d6f72
# Chain Mail 0x436861696e204d61696c
# Steel Plate 0x537465656c20506c617465
# Holy Armor 0x486f6c792041726d6f72
# Shadow Vest 0x536861646f772056657374
# Rogue Garb 0x526f6775652047617262
# Mage Robe 0x4d61676520526f6265
# Warrior Ring 0x57617272696f722052696e67
# Knight Seal 0x4b6e69676874205365616c
# Holy Emblem 0x486f6c7920456d626c656d
# Hunter Mark 0x48756e746572204d61726b
# Shadow Mark 0x536861646f77204d61726b
# Mage Crystal 0x4d616765204372797374616c
# Small Pouch 0x536d616c6c20506f756368
# Adventurer Bag 0x416476656e747572657220426167
# Large Backpack 0x4c61726765204261636b7061636b
# Magic Satchel 0x4d61676963205361746368656c

sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 1,0x4c6561746865722041726d6f72,2,1,2,2,15,0,5,10,0,0,2 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 2,0x52757374792053776f7264,1,1,1,2,10,5,0,0,0,0,1 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 3,0x536d616c6c20506f756368,4,1,2,2,20,0,0,0,0,0,0 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 4,0x5477696e2044616767657273,1,2,1,2,35,12,0,0,0,0,5 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 5,0x57617272696f722052696e67,3,1,1,1,10,0,0,0,1,5,1 --wait --rpc-url $STARKNET_RPC_URL


# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 6,0x426174746c6520417865,1,1,2,2,20,8,0,0,0,0,1 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 7,0x5761722048616d6d6572,1,2,2,2,40,15,0,0,0,0,4 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 8,0x486f6c7920426c616465,1,3,2,3,100,30,0,0,0,0,4 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 9,0x53686f727420426f77,1,1,1,2,15,6,0,0,0,0,2 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 10,0x4372797374616c205374616666,1,3,1,3,80,25,0,0,0,0,3 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 11,0x436861696e204d61696c,2,1,2,2,25,0,8,15,0,0,1 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 12,0x537465656c20506c617465,2,2,2,2,50,0,15,20,0,0,4 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 13,0x486f6c792041726d6f72,2,3,2,2,120,0,25,30,0,0,4 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 14,0x536861646f772056657374,2,1,2,2,20,0,6,12,0,0,5 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 15,0x526f6775652047617262,2,2,2,2,45,0,12,18,0,0,5 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 16,0x4d61676520526f6265,2,3,2,2,90,0,20,25,0,0,3 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 17,0x4b6e69676874205365616c,3,2,1,1,40,0,0,0,2,10,4 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 18,0x486f6c7920456d626c656d,3,3,1,1,75,0,0,0,2,20,4 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 19,0x48756e746572204d61726b,3,1,1,1,12,0,0,0,1,5,2 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 20,0x536861646f77204d61726b,3,2,1,1,35,0,0,0,1,12,5 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 21,0x4d616765204372797374616c,3,3,1,1,75,15,0,0,1,18,3 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 22,0x416476656e747572657220426167,4,1,2,3,35,0,0,0,0,0,0 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 23,0x4c61726765204261636b7061636b,4,2,3,3,60,0,0,0,0,0,0 --wait --rpc-url $STARKNET_RPC_URL
# sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 24,0x4d61676963205361746368656c,4,3,3,4,100,0,0,0,0,0,0 --wait --rpc-url $STARKNET_RPC_URL

