"use client";

import { CartProvider } from "@/src/contexts/CartContext";
import { NotificationProvider } from "@/src/contexts/NotificationContext";
import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { Toaster } from "sonner";

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
          <NotificationProvider>
            <CartProvider>{children}</CartProvider>
          </NotificationProvider>
          <Toaster richColors position="top-right" />
        </HeroUIProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
