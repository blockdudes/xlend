import React, { useEffect, useState } from "react";
import {
  Button,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Typography,
} from "./materialTailwindComponents";
import { LuChevronsUpDown } from "react-icons/lu";
import { SiBitcoincash } from "react-icons/si";
import { useTransactionContext } from "@/context/transactionContext";
import { chains, getContractObject, nativeTokenAddress } from "@/lib/constants";
import { getContract, readContract } from "thirdweb";
import { client } from "@/lib/client";
import { useActiveWalletChain } from "thirdweb/react";
import { Token } from "@/types/types";

export const TokenSelector = () => {
  const { selectedToken, setSelectedToken } = useTransactionContext();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeChain = useActiveWalletChain();

  useEffect(() => {
    if (!activeChain) return;
    const contract = getContractObject(activeChain.id);
    readContract({
      contract,
      method:
        "function getSupportedAssets(uint256 chainSelector) public returns (address[])",
      params: [BigInt(chains[activeChain.id].chainSelector)],
    })
      .then(async (tokens) => {
        var tokenData = await Promise.all(
          tokens.map(async (token) => {
            if (token == nativeTokenAddress) {
              return Promise.resolve({
                name: activeChain.nativeCurrency?.name ?? "Native Token",
                symbol: activeChain.nativeCurrency?.symbol ?? "Native",
                decimals: activeChain.nativeCurrency?.decimals ?? 18,
              });
            }
            var tokenContract = getContract({
              client,
              address: token,
              chain: activeChain,
            });
            const [name, symbol, decimals] = await Promise.all([
              readContract({
                contract: tokenContract,
                method: "function name() public view returns (string)",
              }),
              readContract({
                contract: tokenContract,
                method: "function symbol() public view returns (string)",
              }),
              readContract({
                contract: tokenContract,
                method: "function decimals() public view returns (uint8)",
              }),
            ]);
            return { name, symbol, decimals };
          })
        );

        setTokens(
          tokens.map((token, index) => ({
            name: tokenData[index].name,
            symbol: tokenData[index].symbol,
            decimals: Number(tokenData[index].decimals),
            address: token as `0x${string}`,
          }))
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [activeChain]);

  return (
    <div className="w-full flex flex-col justify-start items-start gap-1">
      <Typography
        variant="h5"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        Select Token
      </Typography>
      <Menu>
        <MenuHandler>
          <Button
            className="!w-full flex justify-between items-center"
            size="lg"
            color="black"
            variant="filled"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            {!selectedToken ? (
              <span className="flex justify-center items-center gap-4">
                <SiBitcoincash />
                Select Token
              </span>
            ) : (
              <span>
                {selectedToken.name} ({selectedToken.symbol})
              </span>
            )}
            <LuChevronsUpDown />
          </Button>
        </MenuHandler>
        <MenuList
          className="!w-[320px] !bg-gray-900 border-gray-700 text-white text-lg"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          {tokens.length > 0 ? (
            tokens.map((token) => (
              <MenuItem
                key={token.address}
                onClick={() => {
                  setSelectedToken(token);
                }}
                className="flex flex-col justify-start items-start"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                {`${token.name} (${token.symbol})`}
                <span className="text-sm opacity-80">
                  address: {token.address.slice(0, 6)}...
                  {token.address.slice(-4)}
                </span>
              </MenuItem>
            ))
          ) : (
            <MenuItem
              className="p-0 m-0"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              {isLoading ? "Loading..." : "No tokens found"}
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </div>
  );
};
