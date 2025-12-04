"use client";

import NotificationBell from "@/src/components/admin/NotificationBell";
import CustomerNotificationBell from "@/src/components/layout/CustomerNotificationBell";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string | null;
  userEmail?: string | null;
  isAuthenticated: boolean;
  currentPath: string;
  userRole?: string | null;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

const MOBILE_MENU_WIDTH = "w-64 sm:w-80";
const MOBILE_BREAKPOINT = 768;

export function MobileMenu({
  isOpen,
  onClose,
  userName,
  userEmail,
  isAuthenticated,
  currentPath,
  userRole,
  triggerRef,
}: MobileMenuProps) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getUserDisplayName = () => {
    return userName || userEmail || "cliente";
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close menu automatically when resizing to desktop
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        onClose();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, onClose]);

  // Focus management and focus trap
  useEffect(() => {
    if (isOpen) {
      // Store the element that had focus before menu opened
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Move focus to first link when menu opens
      firstLinkRef.current?.focus();

      // Focus trap implementation
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab" || !menuRef.current) return;

        const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusableArray = Array.from(focusableElements);
        const firstElement = focusableArray[0];
        const lastElement = focusableArray[focusableArray.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: moving backwards
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: moving forwards
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener("keydown", handleTab);

      const trigger = triggerRef?.current;

      return () => {
        document.removeEventListener("keydown", handleTab);

        // Restore focus to the hamburger button when menu closes
        if (trigger) {
          trigger.focus();
        } else if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, triggerRef]);

  // Animation variants
  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const sidebarVariants = {
    closed: { x: "100%" },
    open: { x: 0 },
  };

  const transition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
  };

  const navigationLinks = [
    { href: "/", label: "Início" },
    { href: "/produtos", label: "Produtos" },
    { href: "/carrinho", label: "Carrinho" },
    { href: "/garantia", label: "Garantia" },
    ...(userRole === "ADMIN"
      ? [{ href: "/admin", label: "Administração" }]
      : []),
  ];

  const handleLinkClick = () => {
    onClose();
  };

  const handleAuthAction = () => {
    onClose();
    if (isAuthenticated) {
      signOut({ callbackUrl: "/" });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={transition}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Sidebar */}
          <motion.nav
            ref={menuRef}
            id="mobile-menu"
            role="navigation"
            aria-label="Menu de navegação mobile"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={transition}
            className={`fixed right-0 top-0 z-50 h-full ${MOBILE_MENU_WIDTH} bg-white shadow-2xl dark:bg-slate-900`}
            style={{ willChange: "transform" }}
          >
            <div className="flex h-full flex-col">
              {/* Header with close button */}
              <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Menu
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar menu"
                  className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* User info (if authenticated) */}
              {/* Welcome Section (Unauthenticated) */}
              {!isAuthenticated && (
                <div className="bg-brand-50 p-4 dark:bg-brand-900/10">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center  dark:text-slate-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-8 w-8"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Bem-vindo
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Entre na sua conta para ver suas compras, favoritos etc.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      as={Link}
                      href="/login"
                      color="primary"
                      className="flex-1 bg-brand-600 text-white"
                      onPress={handleLinkClick}
                    >
                      Entrar
                    </Button>
                    <Button
                      as={Link}
                      href="/login?tab=register"
                      variant="bordered"
                      className="flex-1 bg-white dark:bg-transparent"
                      onPress={handleLinkClick}
                    >
                      Criar conta
                    </Button>
                  </div>
                </div>
              )}

              {/* User info (Authenticated) */}
              {isAuthenticated && (
                <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {getUserDisplayName()}
                  </p>
                  {userName && userEmail && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {userEmail}
                    </p>
                  )}
                </div>
              )}

              {/* Notifications (Authenticated) */}
              {isAuthenticated && (
                <div className="border-b border-slate-200 p-4 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Notificações
                  </span>
                  {userRole === "ADMIN" ? (
                    <NotificationBell />
                  ) : (
                    <CustomerNotificationBell />
                  )}
                </div>
              )}

              {/* Navigation links */}
              <div className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                  {navigationLinks.map((link, index) => (
                    <li key={link.href}>
                      <Link
                        ref={index === 0 ? firstLinkRef : undefined}
                        href={link.href}
                        onClick={handleLinkClick}
                        className={`block rounded-lg px-4 py-3 text-base font-medium transition ${
                          currentPath === link.href
                            ? "bg-danger-50 text-danger-600 dark:bg-danger-900/20 dark:text-danger-400"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {isAuthenticated && (
                    <>
                      <li>
                        <Link
                          href="/minha-conta"
                          onClick={handleLinkClick}
                          className={`block rounded-lg px-4 py-3 text-base font-medium transition ${
                            currentPath === "/minha-conta"
                              ? "bg-danger-50 text-danger-600 dark:bg-danger-900/20 dark:text-danger-400"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          Minha Conta
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/meus-pedidos"
                          onClick={handleLinkClick}
                          className={`block rounded-lg px-4 py-3 text-base font-medium transition ${
                            currentPath === "/meus-pedidos"
                              ? "bg-danger-50 text-danger-600 dark:bg-danger-900/20 dark:text-danger-400"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          Meus Pedidos
                        </Link>
                      </li>
                    </>
                  )}
                </ul>

                <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
                  <div className="flex items-center justify-between px-4">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Tema
                    </span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>

              {/* Auth button (Authenticated only) */}
              {isAuthenticated && (
                <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                  <Button
                    color="danger"
                    variant="flat"
                    className="w-full"
                    onPress={handleAuthAction}
                  >
                    Sair
                  </Button>
                </div>
              )}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
