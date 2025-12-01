"use client";

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
                  onClick={onClose}
                  aria-label="Fechar menu"
                  className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* User info (if authenticated) */}
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
                </ul>
              </div>

              {/* Auth button */}
              <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                {isAuthenticated ? (
                  <Button
                    color="danger"
                    variant="flat"
                    className="w-full"
                    onPress={handleAuthAction}
                  >
                    Sair
                  </Button>
                ) : (
                  <Button
                    as={Link}
                    href="/login"
                    color="danger"
                    className="w-full"
                    onPress={handleLinkClick}
                  >
                    Área do Cliente
                  </Button>
                )}
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
