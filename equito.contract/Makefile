include .env

deploy-arbitrum:
	forge create $(CONTRACT_PATH) \
		--constructor-args ${ARBITRUM_SEPOLIA_ROUTER_CONTRACT_ADDRESS} ${ARBITRUM_SEPOLIA_CHAIN_SELECTOR} ${ARBITRUM_SEPOLIA_NATIVE_TO_USD_PRICE_FEED} \
		--private-key $(PRIVATE_KEY) \
	    --rpc-url ${ARBITRUM_SEPOLIA_RPC_URL} \
		--etherscan-api-key ${ARBISCAN_API_KEY} \
		--verify

deploy-sepolia:
	forge create $(CONTRACT_PATH) \
		--constructor-args ${SEPOLIA_ROUTER_CONTRACT_ADDRESS} ${SEPOLIA_CHAIN_SELECTOR} ${SEPOLIA_NATIVE_TO_USD_PRICE_FEED} \
		--private-key $(PRIVATE_KEY) \
	    --rpc-url ${SEPOLIA_RPC_URL} \
		--etherscan-api-key ${ETHERSCAN_API_KEY} \
		--verify

verify-sepolia:
	forge verify-contract ${SEPOLIA_CONTRACT_ADDRESS} \
		--rpc-url ${SEPOLIA_RPC_URL} \
		--etherscan-api-key ${ETHERSCAN_API_KEY} \
		src/LendingBorrowing.sol:LendingBorrowing \
		--constructor-args $(cast abi-encode "constructor(address, uint256, address)" "0x35D899517F07b1026e36F6418c53BC1305dCA5a5" 1001 "0x694AA1769357215DE4FAC081bf1f309aDC325306")