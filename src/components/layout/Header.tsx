"use client";

import { CartDrawer } from "@/src/components/cart/CartDrawer";
import { MobileMenu } from "@/src/components/layout/MobileMenu";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { useCart } from "@/src/contexts/CartContext";
import { Bars3Icon, ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
import { useRef, useState } from "react";

export function Header() {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);
  const { status, data: session } = useSession();
  const pathname = usePathname();
  const isLoadingSession = status === "loading";
  const isAuthenticated = status === "authenticated";

  const getUserDisplayName = () => {
    return session?.user?.name || session?.user?.email || "cliente";
  };

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
          color="danger"
          variant="flat"
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
      >
        Área do Cliente
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
              <span className="hidden md:inline">IRON DISTRIBUIDORA SC</span>
              <span className="md:hidden">IRON DISTRIB.</span>
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
          {session?.user?.role === "ADMIN" && (
            <NavbarItem>
              <Link
                href="/admin"
                className={`text-sm font-medium transition ${
                  pathname === "/admin"
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                }`}
              >
                Administração
              </Link>
            </NavbarItem>
          )}
        </NavbarContent>
        <NavbarContent justify="end" className="gap-1 sm:gap-2 md:gap-3">
          {/* Hamburger button - mobile only */}
          <NavbarItem className="md:hidden">
            <Button
              ref={hamburgerButtonRef}
              isIconOnly
              variant="light"
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="transition-transform duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-slate-900 dark:text-slate-100" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-slate-900 dark:text-slate-100" />
              )}
            </Button>
          </NavbarItem>

          <NavbarItem>
            <ThemeToggle />
          </NavbarItem>
          {isAuthenticated && (
            <NavbarItem className="hidden text-xs text-slate-600 dark:text-slate-300 sm:flex sm:text-sm">
              {`Bem-vindo, ${getUserDisplayName()}`}
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
              >
                <ShoppingCartIcon className="h-6 w-6 text-slate-900 dark:text-slate-100" />
                {totalItems > 0 && (
                  <span className="absolute right-0 top-0 flex min-h-[1.25rem] min-w-[1.25rem] -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-danger px-1 text-xs font-semibold text-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Button>
            </div>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        userName={session?.user?.name}
        userEmail={session?.user?.email}
        isAuthenticated={isAuthenticated}
        currentPath={pathname}
        userRole={session?.user?.role}
        triggerRef={hamburgerButtonRef}
      />
    </>
  );
}
