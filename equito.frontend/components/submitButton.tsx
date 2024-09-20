"use client";
import React, { useState } from "react";
import { Button } from "./materialTailwindComponents";
import { FaCheckCircle } from "react-icons/fa";
import { useTransactionContext } from "@/context/transactionContext";
import {
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { client } from "@/lib/client";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { nativeTokenAddress, chains } from "@/lib/constants";

export const SubmitButton = ({
  label,
  approve = false,
  onSubmit,
}: {
  label: string;
  approve?: boolean;
  onSubmit: () => Promise<void>;
}) => {
  const { selectedToken, amount } = useTransactionContext();
  const [isApproveLoading, setIsApproveLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const activeChain = useActiveWalletChain();
  const account = useActiveAccount();

  const handleApprove = async () => {
    console.log("approve");
    setIsApproveLoading(true);
    try {
      if (!account) throw new Error("No account");
      if (!selectedToken) throw new Error("No token selected");
      if (!amount) throw new Error("No amount selected");
      if (!activeChain) throw new Error("No active chain");
      const tokenContract = getContract({
        client,
        address: selectedToken?.address,
        chain: activeChain,
      });
      const transaction = prepareContractCall({
        contract: tokenContract,
        method:
          "function approve(address spender, uint256 amount) returns(bool)",
        params: [
          chains[activeChain.id].contractAddress,
          BigInt(amount * 10 ** selectedToken.decimals),
        ],
      });
      const res = await sendAndConfirmTransaction({
        account,
        transaction,
      });
      console.log(res);
      if (res.status === "success") {
        setIsApproved(true);
      } else {
        throw new Error("Failed to approve");
      }
    } catch (error) {
      console.error(error);
    }
    setIsApproveLoading(false);
  };

  const handleSubmit = async () => {
    setIsSubmitLoading(true);
    try {
      if (
        approve &&
        !isApproved &&
        selectedToken?.address !== nativeTokenAddress
      )
        throw new Error("Not approved");

      await onSubmit();
    } catch (error) {
      console.error(error);
    }
    setIsSubmitLoading(false);
  };

  return (
    <div className="w-full mt-4 flex flex-col gap-4">
      {approve &&
        selectedToken !== null &&
        selectedToken.address !== nativeTokenAddress && (
          <Button
            color="black"
            variant="filled"
            size="lg"
            className="w-full flex justify-center items-center gap-2"
            disabled={isApproveLoading || isApproved}
            loading={isApproveLoading}
            onClick={handleApprove}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            {isApproved ? (
              <>
                <FaCheckCircle className="text-success" />
                Approved
              </>
            ) : (
              "Approve"
            )}
          </Button>
        )}
      <Button
        color="black"
        variant="filled"
        size="lg"
        className="w-full flex justify-center items-center gap-2"
        disabled={isSubmitLoading}
        loading={isSubmitLoading}
        onClick={handleSubmit}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        {label}
      </Button>
    </div>
  );
};
