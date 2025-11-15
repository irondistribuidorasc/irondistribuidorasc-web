"use client";

import { CartProvider } from "@/src/contexts/CartContext";
import { HeroUIProvider } from "@heroui/react";
import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <HeroUIProvider>
          <CartProvider>{children}</CartProvider>
        </HeroUIProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
