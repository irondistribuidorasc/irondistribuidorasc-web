"use client";

import { CartDrawer } from "@/src/components/cart/CartDrawer";
import { useCart } from "@/src/contexts/CartContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <Navbar className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <NavbarBrand className="flex-shrink-0 gap-2 min-w-0">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Image
              src="/logo-iron.png"
              alt="IRON DISTRIBUIDORA SC"
              width={48}
              height={48}
              className="h-8 w-8 flex-shrink-0 rounded-full object-cover sm:h-10 sm:w-10"
            />
            <span className="truncate text-xs font-semibold text-slate-900 sm:text-sm md:text-base lg:text-lg">
              <span className="hidden sm:inline">IRON DISTRIBUIDORA SC</span>
              <span className="sm:hidden">IRON DISTRIB.</span>
            </span>
          </Link>
        </NavbarBrand>
        <NavbarContent justify="center" className="hidden gap-6 md:flex">
          <NavbarItem>
            <Link
              href="/pedido"
              className="text-sm font-medium text-slate-700 transition hover:text-brand-600"
            >
              Fazer pedido
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              href="/garantia"
              className="text-sm font-medium text-slate-700 transition hover:text-brand-600"
            >
              Garantia
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end" className="gap-1 sm:gap-2 md:gap-3">
          <NavbarItem className="md:hidden">
            <Button
              as={Link}
              href="/pedido"
              variant="light"
              size="sm"
              className="min-w-fit px-2 text-xs"
            >
              Pedido
            </Button>
          </NavbarItem>
          <NavbarItem className="md:hidden">
            <Button
              as={Link}
              href="/garantia"
              variant="light"
              size="sm"
              className="min-w-fit px-2 text-xs"
            >
              Garantia
            </Button>
          </NavbarItem>
          <NavbarItem>
            <div className="relative">
              <Button
                isIconOnly
                aria-label="Abrir carrinho"
                variant="light"
                onPress={() => setIsCartOpen(true)}
                className="overflow-visible"
              >
                <ShoppingCartIcon className="h-6 w-6 text-slate-900" />
              </Button>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </div>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
