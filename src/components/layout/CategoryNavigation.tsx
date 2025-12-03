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
        className={`text-sm font-medium transition ${
          pathname === "/produtos" && !currentCategory
            ? "text-brand-600 dark:text-brand-400"
            : "text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
        }`}
      >
        Todos Produtos
      </Link>
      <Link
        href="/produtos?category=display"
        className={`text-sm font-medium transition ${
          currentCategory === "display"
            ? "text-brand-600 dark:text-brand-400"
            : "text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
        }`}
      >
        Display
      </Link>
      <Link
        href="/produtos?category=battery"
        className={`text-sm font-medium transition ${
          currentCategory === "battery"
            ? "text-brand-600 dark:text-brand-400"
            : "text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
        }`}
      >
        Bateria
      </Link>
      <Link
        href="/produtos?category=charging_board"
        className={`text-sm font-medium transition ${
          currentCategory === "charging_board"
            ? "text-brand-600 dark:text-brand-400"
            : "text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
        }`}
      >
        Placa de Carga
      </Link>
      <Link
        href="/produtos?category=back_cover"
        className={`text-sm font-medium transition ${
          currentCategory === "back_cover"
            ? "text-brand-600 dark:text-brand-400"
            : "text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
        }`}
      >
        Tampa Traseira
      </Link>
    </nav>
  );
}
