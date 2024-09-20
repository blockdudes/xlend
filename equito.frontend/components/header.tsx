"use client";
import React from "react";
import { ConnectWalletButton } from "./connectWalletButton";
import Image from "next/image";
import { Merienda } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";

const merienda = Merienda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const Header = () => {
  const pathname = usePathname();
  const navigation = [
    {
      name: "Lend",
      href: "/lend",
    },
    {
      name: "Withdraw",
      href: "/withdraw",
    },
    {
      name: "Borrow",
      href: "/borrow",
    },
    {
      name: "Repay",
      href: "/repay",
    },
  ];

  return (
    <div className="h-[100px] p-4 bg-card-background/80 backdrop-blur-3xl shadow-xl flex justify-between items-center">
      <div className="flex items-center gap-1">
        <Image src="/logo.png" alt="xlend" width={65} height={65} />
        <div
          className={`text-4xl font-bold bg-app-name-gradient bg-clip-text text-transparent drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.8)] ${merienda.className} font-bold`}
        >
          Lend
        </div>
      </div>
      <div className="flex items-center gap-8">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`text-xl font-medium ${
              pathname === item.href
                ? "text-focused hover:text-primary"
                : "text-primary hover:text-focused"
            } hover:drop-shadow-lg`}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <ConnectWalletButton />
    </div>
  );
};
