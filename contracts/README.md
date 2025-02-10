## Deploy on sepolia

export STARKNET_RPC_URL=https://api.cartridge.gg/x/starknet/sepolia
export DOJO_ACCOUNT_ADDRESS=
export DOJO_PRIVATE_KEY=

sozo build -P release

sozo migrate -P release

slot deployments create nothing-game torii \
 --rpc https://api.cartridge.gg/x/starknet/sepolia \
 --world 0x0456e4818b95a2fffc646f691e8df897952d2bb7e520232bdeeb26d91259ece9 \
 --version 1.0.9

https://api.cartridge.gg/x/nothing-game/torii

./scripts/add_item.sh
