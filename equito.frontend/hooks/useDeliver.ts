import { Hex, prepareContractCall, sendAndConfirmTransaction } from "thirdweb";

import { useCallback } from "react";
import { EquitoMessage } from "@equito-sdk/core";
import { Chain } from "@/types/types";
import { useActiveAccount, useSwitchActiveWalletChain } from "thirdweb/react";
import { getRouterObject } from "@/lib/constants";

export const useDeliver = ({ chain }: { chain?: Chain }) => {
  const switchChain = useSwitchActiveWalletChain();
  const chainId = chain?.definition.id;
  const account = useActiveAccount();

  const execute = useCallback(
    async (
      proof: Hex,
      message: EquitoMessage,
      messageData: Hex,
      fee?: bigint
    ) => {
      if (!chainId || !chain) {
        throw new Error("No chain found, please select a chain");
      }
      if (!account) {
        throw new Error("No Account found, please connect your wallet");
      }

      try {
        await switchChain(chain.definition);
        const routerContract = getRouterObject(chainId);
        console.log("routerContract", routerContract);
        const transaction = prepareContractCall({
          contract: routerContract,
          method:
            "function deliverAndExecuteMessage((uint256 blockNumber, uint256 sourceChainSelector, (bytes32, bytes32) sender, uint256 destinationChainSelector, (bytes32, bytes32) receiver, bytes32 hashedData) calldata message, bytes calldata messageData, uint256 verifierIndex, bytes calldata proof ) external payable",
          params: [
            {
              blockNumber: message.blockNumber,
              sourceChainSelector: message.sourceChainSelector,
              sender: [message.sender.lower, message.sender.upper],
              destinationChainSelector: message.destinationChainSelector,
              receiver: [message.receiver.lower, message.receiver.upper],
              hashedData: message.hashedData,
            },
            messageData,
            BigInt(0),
            proof,
          ],
          value: fee,
        });
        console.log("transaction", transaction);
        return await sendAndConfirmTransaction({
          account,
          transaction,
        });
      } catch (error) {
        console.log({ error });
        throw new Error("Transaction failed");
      }
    },
    [chain, chainId, switchChain, account]
  );

  return {
    execute,
  };
};
