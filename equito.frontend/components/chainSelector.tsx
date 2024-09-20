import React from "react";
import {
  Button,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Typography,
} from "./materialTailwindComponents";
import { LuChevronsUpDown } from "react-icons/lu";
import {
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { chains as supportedChains } from "@/lib/constants";
import Image from "next/image";

export const ChainSelector = () => {
  const switchChain = useSwitchActiveWalletChain();
  const activeChain = useActiveWalletChain();

  return (
    <div className="w-full flex flex-col justify-start items-start gap-1">
      <Typography
        variant="h5"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        Select Chain
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
            {!activeChain ? (
              <span className="flex justify-center items-center gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-link h-4 w-4"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                Select Chain
              </span>
            ) : (
              <span>
                {activeChain.name ?? `Unknown Chain: ${activeChain.id}`}
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
          {Object.values(supportedChains).length > 0 ? (
            Object.values(supportedChains).map((chain) => (
              <MenuItem
                key={chain.definition.id}
                onClick={() => {
                  switchChain(chain.definition);
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                <span className="flex justify-start items-center gap-4">
                  <Image
                    src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${chain.img}.png`}
                    width={24}
                    height={24}
                    className="rounded-full"
                    alt="logo-chain"
                  />
                  {chain.definition.name ??
                    `Unknown Chain: ${chain.definition.id}`}
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
              No chains found
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </div>
  );
};
