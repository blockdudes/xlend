"use client";
import { Token } from "@/types/types";
import React, { createContext, useState, useContext, ReactNode } from "react";

type TransactionContextProps = {
  selectedToken: Token | null;
  setSelectedToken: (token: Token) => void;
  amount: number | null;
  setAmount: (amount: number) => void;
  isApproved: boolean | null;
  setIsApproved: (isApproved: boolean) => void;
};

const TransactionContext = createContext<TransactionContextProps | null>(null);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  return (
    <TransactionContext.Provider
      value={{
        selectedToken,
        setSelectedToken,
        amount,
        setAmount,
        isApproved,
        setIsApproved,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactionContext must be used within a TransactionProvider"
    );
  }
  return context;
};
