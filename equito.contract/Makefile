include .env

deploy-polygon:
	forge create $(CONTRACT_PATH) \
		--constructor-args ${POLYGON_AMOY_ROUTER_CONTRACT_ADDRESS} ${POLYGON_AMOY
		_CHAIN_SELECTOR} \
		--private-key $(PRIVATE_KEY) \
	    --rpc-url ${POLYGON_AMOY_RPC_URL} \
		--etherscan-api-key ${POLYGONSCAN_API_KEY} \
		--verify

deploy-sepolia:
	forge create $(CONTRACT_PATH) \
		--constructor-args ${SEPOLIA_ROUTER_CONTRACT_ADDRESS} ${SEPOLIA_CHAIN_SELECTOR} \
		--private-key $(PRIVATE_KEY) \
	    --rpc-url ${SEPOLIA_RPC_URL} \
		--etherscan-api-key ${ETHERSCAN_API_KEY} \
		--verify