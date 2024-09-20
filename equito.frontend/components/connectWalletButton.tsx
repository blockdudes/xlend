"use client";
import { client } from "@/lib/client";
import { chains } from "@/lib/constants";
import React from "react";
import { ConnectButton } from "thirdweb/react";

export const ConnectWalletButton = () => {
  return (
    <ConnectButton
      client={client}
      autoConnect={true}
      chains={Object.values(chains).map((chain) => chain.definition)}
      onConnect={(wallet) => {
        const chain = wallet.getChain();
        if (chain && !chains[chain?.id]) {
          wallet.switchChain(Object.values(chains)[0].definition);
        }
      }}
      connectModal={{
        size: "wide",
        titleIcon:
          "https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/lclwset1pntxjekz0bw0",
      }}
      connectButton={{
        label: "Connect Wallet",
      }}
    />
  );
};
