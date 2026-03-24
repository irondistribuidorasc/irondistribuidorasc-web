"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function CategoryNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <nav className="flex gap-8">
      <Link
        href="/produtos"
        className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
          pathname === "/produtos" && !currentCategory
            ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
            : "border-transparent text-default-600 hover:text-brand-600 dark:hover:text-brand-400"
        }`}
      >
        Todos Produtos
      </Link>
      <Link
        href="/produtos?category=display"
        className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
          currentCategory === "display"
            ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
            : "border-transparent text-default-600 hover:text-brand-600 dark:hover:text-brand-400"
        }`}
      >
        Display
      </Link>
      <Link
        href="/produtos?category=battery"
        className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
          currentCategory === "battery"
            ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
            : "border-transparent text-default-600 hover:text-brand-600 dark:hover:text-brand-400"
        }`}
      >
        Bateria
      </Link>
      <Link
        href="/produtos?category=charging_board"
        className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
          currentCategory === "charging_board"
            ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
            : "border-transparent text-default-600 hover:text-brand-600 dark:hover:text-brand-400"
        }`}
      >
        Placa de Carga
      </Link>
      <Link
        href="/produtos?category=back_cover"
        className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
          currentCategory === "back_cover"
            ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
            : "border-transparent text-default-600 hover:text-brand-600 dark:hover:text-brand-400"
        }`}
      >
        Tampa Traseira
      </Link>
      <Link
        href="/produtos?category=home_button"
        className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
          currentCategory === "home_button"
            ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
            : "border-transparent text-default-600 hover:text-brand-600 dark:hover:text-brand-400"
        }`}
      >
        Botão Home / Digital Biometria
      </Link>
    </nav>
  );
}
