"use client";
import React from "react";
import { AmountInput } from "@/components/amountInput";
import { ChainSelector } from "@/components/chainSelector";
import { CustomCard } from "@/components/customCard";
import { Typography } from "@/components/materialTailwindComponents";
import { SubmitButton } from "@/components/submitButton";
import { TokenSelector } from "@/components/tokenSelector";
import { client } from "@/lib/client";
import {
  getRouterObject,
  chains,
  getContractObject,
  nativeTokenAddress,
} from "@/lib/constants";
import { generateHash } from "@equito-sdk/viem";
import {
  readContract,
  prepareContractCall,
  sendAndConfirmTransaction,
  parseEventLogs,
  prepareEvent,
  eth_getBlockByNumber,
  getRpcClient,
} from "thirdweb";
import { useTransactionContext } from "@/context/transactionContext";
import { useApprove } from "@/hooks/useApprove";
import { useDeliver } from "@/hooks/useDeliver";
import { useActiveWalletChain, useActiveAccount } from "thirdweb/react";

const Borrow = () => {
  const activeChain = useActiveWalletChain();
  const account = useActiveAccount();
  const { selectedToken, amount } = useTransactionContext();
  const approve = useApprove();
  const deliver = useDeliver({
    chain:
      activeChain &&
      (activeChain.id === 11155111 ? chains[421614] : chains[11155111]),
  });

  return (
    <div className="h-full w-full px-60 py-20">
      <CustomCard imagePath="/borrow-asset.png">
        <Typography
          variant="h1"
          className="text-primary"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Borrow
        </Typography>
        <ChainSelector />
        <TokenSelector />
        <AmountInput />
        <SubmitButton
          label="Borrow"
          onSubmit={async () => {
            try {
              if (!account) throw new Error("No account");
              if (!selectedToken) throw new Error("No token selected");
              if (!amount) throw new Error("No amount selected");
              if (!activeChain) throw new Error("No active chain");

              const routerContract = getRouterObject(activeChain.id);
              const routerFee = await readContract({
                contract: routerContract,
                method: "function getFee(address sender) returns (uint256)",
                params: [chains[activeChain.id].contractAddress],
              });
              console.log(routerFee);
              const contract = getContractObject(activeChain.id);
              const transaction = prepareContractCall({
                contract,
                method:
                  "function borrow(address token, uint256 amount) payable",
                params: [
                  selectedToken.address,
                  BigInt(amount * 10 ** selectedToken.decimals),
                ],
                value:
                  routerFee +
                  (selectedToken.address !== nativeTokenAddress
                    ? BigInt(0)
                    : BigInt(amount * 10 ** 18)),
              });
              const res = await sendAndConfirmTransaction({
                account,
                transaction,
              });
              console.log(res);
              if (res.status == "success") {
                console.log("Transaction successful");
                const sentMessage: any = parseEventLogs({
                  logs: res.logs,
                  events: [
                    prepareEvent({
                      signature:
                        "event MessageSendRequested((uint256 blockNumber, uint256 sourceChainSelector, (bytes32 lower, bytes32 upper) sender, uint256 destinationChainSelector, (bytes32 lower, bytes32 upper) receiver, bytes32 hashedData) message, bytes data)",
                    }),
                  ],
                }).flatMap(({ eventName, args }) =>
                  eventName === "MessageSendRequested" ? [args] : []
                )[0];
                console.log("sentMessage", sentMessage);
                console.log("message", sentMessage.message);
                const { timestamp } = await eth_getBlockByNumber(
                  getRpcClient({ client, chain: activeChain }),
                  {
                    blockNumber: res.blockNumber,
                    includeTransactions: true,
                  }
                );
                console.log("timestamp", timestamp);
                const { proof } = await approve.execute({
                  chainSelector: sentMessage.message.destinationChainSelector,
                  fromTimestamp: Number(timestamp) * 1000,
                  messageHash: generateHash(sentMessage.message),
                });
                console.log("proof", proof);
                const deliverMessage = await deliver.execute(
                  proof,
                  sentMessage.message,
                  sentMessage.data,
                  BigInt(1e13)
                );
                console.log("deliverMessage", deliverMessage);
              } else {
                console.log("Transaction failed");
              }
            } catch (error) {
              console.error(error);
            }
          }}
        />
      </CustomCard>
    </div>
  );
};

export default Borrow;
