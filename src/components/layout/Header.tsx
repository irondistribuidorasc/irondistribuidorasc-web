"use client";

import { CartDrawer } from "@/src/components/cart/CartDrawer";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { useCart } from "@/src/contexts/CartContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Header() {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { status, data: session } = useSession();
  const pathname = usePathname();
  const isLoadingSession = status === "loading";
  const isAuthenticated = status === "authenticated";

  const renderAuthButton = () => {
    if (isLoadingSession) {
      return (
        <Button variant="light" size="sm" className="min-w-fit" isDisabled>
          Carregando...
        </Button>
      );
    }

    if (isAuthenticated) {
      return (
        <Button
          variant="bordered"
          size="sm"
          className="min-w-fit"
          onPress={() => signOut({ callbackUrl: "/" })}
        >
          Sair
        </Button>
      );
    }

    return (
      <Button
        as={Link}
        href="/login"
        color="danger"
        size="sm"
        className="bg-brand-600 text-white"
      >
        Entrar
      </Button>
    );
  };

  return (
    <>
      <Navbar className="border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <NavbarBrand className="flex-shrink-0 gap-2 min-w-0">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Image
              src="/logo-iron.png"
              alt="IRON DISTRIBUIDORA SC"
              width={48}
              height={48}
              className="h-8 w-8 flex-shrink-0 rounded-full object-cover sm:h-10 sm:w-10"
            />
            <span className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100 sm:text-sm md:text-base lg:text-lg">
              <span className="hidden sm:inline">IRON DISTRIBUIDORA SC</span>
              <span className="sm:hidden">IRON DISTRIB.</span>
            </span>
          </Link>
        </NavbarBrand>
        <NavbarContent justify="center" className="hidden gap-6 md:flex">
          <NavbarItem>
            <Link
              href="/produtos"
              className={`text-sm font-medium transition ${
                pathname === "/produtos"
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
              }`}
            >
              Produtos
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              href="/carrinho"
              className={`text-sm font-medium transition ${
                pathname === "/carrinho"
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
              }`}
            >
              Carrinho
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              href="/garantia"
              className={`text-sm font-medium transition ${
                pathname === "/garantia"
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
              }`}
            >
              Garantia
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end" className="gap-1 sm:gap-2 md:gap-3">
          <NavbarItem>
            <ThemeToggle />
          </NavbarItem>
          <NavbarItem className="md:hidden">
            <Button
              as={Link}
              href="/produtos"
              variant="light"
              size="sm"
              className={`min-w-fit px-2 text-xs ${
                pathname === "/produtos" ? "text-brand-600 dark:text-brand-400" : ""
              }`}
            >
              Produtos
            </Button>
          </NavbarItem>
          <NavbarItem className="md:hidden">
            <Button
              as={Link}
              href="/carrinho"
              variant="light"
              size="sm"
              className={`min-w-fit px-2 text-xs ${
                pathname === "/carrinho" ? "text-brand-600 dark:text-brand-400" : ""
              }`}
            >
              Carrinho
            </Button>
          </NavbarItem>
          <NavbarItem className="md:hidden">
            <Button
              as={Link}
              href="/garantia"
              variant="light"
              size="sm"
              className={`min-w-fit px-2 text-xs ${
                pathname === "/garantia" ? "text-brand-600 dark:text-brand-400" : ""
              }`}
            >
              Garantia
            </Button>
          </NavbarItem>
          {isAuthenticated && (
            <NavbarItem className="hidden text-xs text-slate-600 dark:text-slate-300 sm:flex sm:text-sm">
              {`Bem-vindo, ${session?.user?.name || session?.user?.email || "cliente"}`}
            </NavbarItem>
          )}
          <NavbarItem>{renderAuthButton()}</NavbarItem>
          <NavbarItem>
            <div className="relative">
              <Button
                isIconOnly
                aria-label="Abrir carrinho"
                variant="light"
                onPress={() => setIsCartOpen(true)}
                className="overflow-visible"
              >
                <ShoppingCartIcon className="h-6 w-6 text-slate-900 dark:text-slate-100" />
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
