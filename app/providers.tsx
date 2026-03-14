"use client";

import { InputInteractionFix } from "@/src/components/layout/InputInteractionFix";
import { CartProvider } from "@/src/contexts/CartContext";
import { NotificationProvider } from "@/src/contexts/NotificationContext";
import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";
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
          <InputInteractionFix>
            <NotificationProvider>
              <CartProvider>{children}</CartProvider>
            </NotificationProvider>
          </InputInteractionFix>
          <Toaster richColors position="top-right" />
        </HeroUIProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
