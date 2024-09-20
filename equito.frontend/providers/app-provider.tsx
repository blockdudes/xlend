import { TransactionProvider } from "@/context/transactionContext";
import React from "react";
import { ThirdwebProvider } from "thirdweb/react";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThirdwebProvider>
      <TransactionProvider>{children}</TransactionProvider>
    </ThirdwebProvider>
  );
};

export default AppProvider;
