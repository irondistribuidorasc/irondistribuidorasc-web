"use client";

import { categoryOptions } from "@/src/data/products";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function CategoryNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <nav className="flex flex-wrap gap-8">
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
      {categoryOptions.map((category) => (
        <Link
          key={category.key}
          href={`/produtos?category=${category.key}`}
          className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
            currentCategory === category.key
              ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-default-600 hover:text-brand-600 dark:hover:text-brand-400"
          }`}
        >
          {category.label}
        </Link>
      ))}
    </nav>
  );
}
