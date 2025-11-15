import type { Product } from "@/src/data/products";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  isLoading?: boolean;
};

export function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-96 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
            aria-label="Carregando produto"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-600 dark:bg-slate-800">
        <svg
          className="h-16 w-16 text-slate-400 dark:text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Nenhum produto encontrado
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tente ajustar os filtros ou realizar uma nova busca.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
      role="list"
      aria-label="Lista de produtos"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

