import type { Metadata } from "next";
import "./globals.css";
import AppProvider from "../providers/app-provider";
import { Header } from "@/components/header";
import Background from "@/components/background";

export const metadata: Metadata = {
  title: "XLend",
  description: "Lending/Borrowing Protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={
          "h-screen w-screen antialiased bg-background text-foreground"
        }
      >
        <Background />
        <AppProvider>
          <div className="absolute top-0 bottom-0 left-0 right-0 z-10 h-full w-full">
            <Header />
            <div className="h-[calc(100vh-100px)] w-full">{children}</div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
