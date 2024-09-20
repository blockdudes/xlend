import { ContractOptions, getContract } from "thirdweb";
import { client } from "./client";
import { arbitrumSepolia, sepolia } from "thirdweb/chains";
import { Chain } from "@/types/types";

export const chains: { [chainId: number]: Chain } = {
  [sepolia.id]: {
    chainSelector: 1001,
    img: 1027,
    definition: sepolia,
    contractAddress: "0xbc9E3227d66aBD34450d452598Bac45ec723d175",
    routerAddress: "0x35D899517F07b1026e36F6418c53BC1305dCA5a5",
  },
  [arbitrumSepolia.id]: {
    chainSelector: 1004,
    img: 11841,
    definition: arbitrumSepolia,
    contractAddress: "0x05d3076a59020B0E2896CC351db3Ab04c67F7aD8",
    routerAddress: "0x5C5386A7D14d9D6c24913386db74c20e36Bc436c",
  },
};

export const nativeTokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const getContractObject = (chainId: number): ContractOptions => {
  return getContract({
    client,
    address: chains[chainId].contractAddress,
    chain: chains[chainId].definition,
  });
};

export const getRouterObject = (chainId: number): ContractOptions => {
  return getContract({
    client,
    address: chains[chainId].routerAddress,
    chain: chains[chainId].definition,
  });
};
