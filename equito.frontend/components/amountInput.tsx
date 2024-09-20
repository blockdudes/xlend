"use client";

import React from "react";
import { Input, Typography } from "./materialTailwindComponents";
import { useTransactionContext } from "@/context/transactionContext";

export const AmountInput = () => {
  const { amount, setAmount } = useTransactionContext();
  return (
    <div className="w-full flex flex-col justify-start items-start gap-1">
      <Typography
        variant="h5"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        Enter Amount
      </Typography>
      <Input
        value={amount ?? 0}
        onChange={(e) => setAmount(Number(e.target.value))}
        type="number"
        inputMode="decimal"
        className="!bg-gray-900 !text-white !border-gray-900 !text-lg !font-bold px-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        size="lg"
        labelProps={{
          className: "before:content-none after:content-none",
        }}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        crossOrigin={undefined}
      />
    </div>
  );
};
