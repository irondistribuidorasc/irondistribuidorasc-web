"use client";

import NotificationBell from "@/src/components/admin/NotificationBell";
import { CartDrawer } from "@/src/components/cart/CartDrawer";
import { GlobalSearch } from "@/src/components/layout/GlobalSearch";
import { MobileMenu } from "@/src/components/layout/MobileMenu";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { useCart } from "@/src/contexts/CartContext";
import {
  Bars3Icon,
  ShoppingCartIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { CategoryNavigation } from "./CategoryNavigation";
import CustomerNotificationBell from "./CustomerNotificationBell";

export function Header() {
  const { totalItems, isCartOpen, openCart, closeCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);
  const { status, data: session } = useSession();
  const pathname = usePathname();
  const isLoadingSession = status === "loading";
  const isAuthenticated = status === "authenticated";

  const getUserDisplayName = () => {
    return session?.user?.name || session?.user?.email || "cliente";
  };

  const renderUserMenu = () => {
    if (isLoadingSession) {
      return (
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
      );
    }

    if (isAuthenticated) {
      return (
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="danger"
              name={getUserDisplayName()}
              size="sm"
              src={session?.user?.image || undefined}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Logado como</p>
              <p className="font-semibold">{session?.user?.email}</p>
            </DropdownItem>
            <DropdownItem key="settings" href="/minha-conta">
              Minha Conta
            </DropdownItem>
            <DropdownItem key="orders" href="/meus-pedidos">
              Meus Pedidos
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              onPress={() => signOut({ callbackUrl: "/" })}
            >
              Sair
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      );
    }

    return (
      <Button
        as={Link}
        href="/login"
        color="danger"
        variant="flat"
        size="sm"
        className="font-medium"
      >
        Entrar
      </Button>
    );
  };

  return (
    <div className="flex flex-col w-full print:hidden">
      <Navbar
        className="border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"
        maxWidth="xl"
        position="static"
      >
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

        <NavbarContent className="hidden md:flex flex-1 px-4" justify="center">
          <GlobalSearch />
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
          <NavbarItem className="flex items-center gap-2">
            {session?.user?.role === "ADMIN" && <NotificationBell />}
            {session?.user?.role === "USER" && <CustomerNotificationBell />}
            <ThemeToggle />
            {renderUserMenu()}
          </NavbarItem>
          <NavbarItem>
            <div className="relative">
              <Button
                isIconOnly
                aria-label="Abrir carrinho"
                variant="light"
                onPress={openCart}
              >
                <ShoppingCartIcon className="h-6 w-6 text-slate-900 dark:text-slate-100" />
              </Button>
              {totalItems > 0 && (
                <span className="pointer-events-none absolute right-0 top-0 flex min-h-[1.25rem] min-w-[1.25rem] -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-danger px-1 text-xs font-semibold text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </div>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* Sub-header for Desktop Navigation */}
      <div className="hidden md:flex w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 py-2">
        <div className="mx-auto w-full max-w-7xl px-6 flex justify-center">
          <Suspense fallback={<div className="h-6 w-full" />}>
            <CategoryNavigation />
          </Suspense>
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`ml-8 text-sm font-medium transition ${
                pathname === "/admin"
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
              }`}
            >
              Administração
            </Link>
          )}
        </div>
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
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
    </div>
  );
}
