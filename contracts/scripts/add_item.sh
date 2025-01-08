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
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 1, 'Rusty Sword', 1, 1, 1, 2, 10, 5, 0, 0, 0, 0, 1 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 2, 'Battle Axe', 1, 1, 2, 2, 20, 8, 0, 0, 0, 0, 1 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 3, 'War Hammer', 1, 2, 2, 2, 40, 15, 0, 0, 0, 0, 4 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 4, 'Holy Blade', 1, 3, 2, 3, 100, 30, 0, 0, 0, 0, 4 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 5, 'Short Bow', 1, 1, 2, 1, 15, 6, 0, 0, 0, 0, 2 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 6, 'Twin Daggers', 1, 2, 2, 1, 35, 12, 0, 0, 0, 0, 5 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 7, 'Crystal Staff', 1, 3, 1, 3, 80, 25, 0, 0, 0, 0, 3 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 8, 'Leather Armor', 2, 1, 2, 2, 15, 0, 5, 10, 0, 0, 2 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 9, 'Chain Mail', 2, 1, 2, 2, 25, 0, 8, 15, 0, 0, 1 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 10, 'Steel Plate', 2, 2, 2, 2, 50, 0, 15, 20, 0, 0, 4 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 11, 'Holy Armor', 2, 3, 2, 2, 120, 0, 25, 30, 0, 0, 4 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 12, 'Shadow Vest', 2, 1, 2, 2, 20, 0, 6, 12, 0, 0, 5 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 13, 'Rogue Garb', 2, 2, 2, 2, 45, 0, 12, 18, 0, 0, 5 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 14, 'Mage Robe', 2, 3, 2, 2, 90, 0, 20, 25, 0, 0, 3 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 15, 'Warrior Ring', 3, 1, 1, 1, 10, 3, 2, 5, 1, 1, 1 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 16, 'Knight Seal', 3, 2, 1, 1, 40, 0, 8, 15, 2, 2, 4 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 17, 'Holy Emblem', 3, 3, 1, 1, 75, 5, 10, 15, 2, 3, 4 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 18, 'Hunter Mark', 3, 1, 1, 1, 12, 3, 0, 0, 1, 1, 2 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 19, 'Shadow Mark', 3, 2, 1, 1, 35, 7, 0, 0, 1, 2, 5 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 20, 'Mage Crystal', 3, 3, 1, 1, 75, 15, 0, 0, 1, 3, 3 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 21, 'Small Pouch', 4, 1, 2, 2, 20, 0, 0, 0, 0, 0, 0 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 22, 'Adventurer Bag', 4, 1, 2, 3, 35, 0, 0, 0, 0, 0, 0 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 23, 'Large Backpack', 4, 2, 3, 3, 60, 0, 0, 0, 0, 0, 0 --wait --rpc-url $STARKNET_RPC_URL
sozo execute --world $WORLD_ADDRESS $ITEM_STSTEM_ADDRESS add_item -c 24, 'Magic Satchel', 4, 3, 3, 4, 100, 0, 0, 0, 0, 0, 0 --wait --rpc-url $STARKNET_RPC_URL
