include .env

deploy-arbitrum:
	forge create $(CONTRACT_PATH) \
		--constructor-args ${ARBITRUM_SEPOLIA_ROUTER_CONTRACT_ADDRESS} ${ARBITRUM_SEPOLIA_CHAIN_SELECTOR} \
		--private-key $(PRIVATE_KEY) \
	    --rpc-url ${ARBITRUM_SEPOLIA_RPC_URL} \
		--etherscan-api-key ${ARBISCAN_API_KEY} \
		--verify

deploy-sepolia:
	forge create $(CONTRACT_PATH) \
		--constructor-args ${SEPOLIA_ROUTER_CONTRACT_ADDRESS} ${SEPOLIA_CHAIN_SELECTOR} \
		--private-key $(PRIVATE_KEY) \
	    --rpc-url ${SEPOLIA_RPC_URL} \
		--etherscan-api-key ${ETHERSCAN_API_KEY} \
		--verify