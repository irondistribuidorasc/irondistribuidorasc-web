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
        <NavbarBrand className="gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-iron.png"
              alt="IRON DISTRIBUIDORA SC"
              width={48}
              height={48}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="text-base font-semibold text-slate-900 md:text-lg">
              IRON DISTRIBUIDORA SC
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
        <NavbarContent justify="end" className="gap-3">
          <NavbarItem className="md:hidden">
            <Button as={Link} href="/pedido" variant="light" size="sm">
              Pedido
            </Button>
          </NavbarItem>
          <NavbarItem className="md:hidden">
            <Button as={Link} href="/garantia" variant="light" size="sm">
              Garantia
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button
              isIconOnly
              aria-label="Abrir carrinho"
              variant="light"
              onPress={() => setIsCartOpen(true)}
              className="relative"
            >
              <ShoppingCartIcon className="h-6 w-6 text-slate-900" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                  {totalItems}
                </span>
              )}
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
