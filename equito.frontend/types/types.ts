import { Address, Chain as Definition } from "thirdweb";

export type Token = {
  name: string;
  symbol: string;
  decimals: number;
  address: Address;
};

export type Chain = {
  chainSelector: number;
  img: number;
  definition: Definition;
  contractAddress: Address;
  routerAddress: Address;
};
