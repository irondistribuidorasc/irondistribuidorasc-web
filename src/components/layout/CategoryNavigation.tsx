"use client";

import { categoryOptions } from "@/src/data/products";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function CategoryNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const baseLinkClass =
    "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const inactiveLinkClass =
    "border-divider bg-content1 text-default-600 hover:border-brand-200 hover:text-brand-600 dark:hover:border-brand-500/40 dark:hover:text-brand-400";
  const activeLinkClass =
    "border-brand-600 bg-brand-600 text-white shadow-sm dark:border-brand-500 dark:bg-brand-500 dark:text-white";

  const getLinkClassName = (isActive: boolean) =>
    `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`;

  return (
    <nav
      aria-label="Categorias de produtos"
      className="-mx-4 overflow-x-auto px-4 py-1 md:mx-0 md:px-0"
    >
      <div className="flex min-w-max items-center gap-2 md:min-w-0 md:flex-wrap">
        <Link
          href="/produtos"
          aria-current={
            pathname === "/produtos" && !currentCategory ? "page" : undefined
          }
          className={getLinkClassName(pathname === "/produtos" && !currentCategory)}
        >
          Todos Produtos
        </Link>
        {categoryOptions.map((category) => (
          <Link
            key={category.key}
            href={`/produtos?category=${category.key}`}
            aria-current={currentCategory === category.key ? "page" : undefined}
            className={getLinkClassName(currentCategory === category.key)}
          >
            {category.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
