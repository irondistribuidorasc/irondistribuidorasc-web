"use client";

import { CartProvider } from "@/src/contexts/CartContext";
import { HeroUIProvider } from "@heroui/react";
import { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <HeroUIProvider>
      <CartProvider>{children}</CartProvider>
    </HeroUIProvider>
  );
}
