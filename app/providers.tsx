"use client";

import { CartProvider } from "@/src/contexts/CartContext";
import { HeroUIProvider } from "@heroui/react";
import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

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
      <HeroUIProvider>
        <CartProvider>{children}</CartProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
