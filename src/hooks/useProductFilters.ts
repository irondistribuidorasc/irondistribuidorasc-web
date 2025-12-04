"use client";

import type { Brand, Category, Product } from "@/src/data/products";
import type { ProductFilters, SortOption } from "@/src/lib/productUtils";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";

type UseProductFiltersReturn = {
  // Produtos processados (pass-through do server)
  paginatedProducts: Product[];
  totalProducts: number;
  totalPages: number;

  // Estado de paginação
  currentPage: number;
  itemsPerPage: number;
  setPage: (page: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;

  // Filtros
  filters: ProductFilters;
  setSearchQuery: (query: string) => void;
  toggleBrand: (brand: Brand) => void;
  toggleCategory: (category: Category) => void;
  setInStockOnly: (inStockOnly: boolean) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;

  // Ordenação
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;

  // Loading state
  isPending: boolean;
};

const ITEMS_PER_PAGE = 60;

export function useProductFilters(
  products: Product[],
  totalProducts: number,
  totalPages: number,
  currentPage: number,
  initialSearchQuery: string = "",
  initialCategory?: Category,
  initialBrand?: Brand
): UseProductFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Get current state from URL or props
  const currentSort = (searchParams.get("sort") as SortOption) || "relevance";
  const currentInStock = searchParams.get("inStock") === "true";

  // Construct filters object
  const filters: ProductFilters = useMemo(
    () => ({
      searchQuery: initialSearchQuery,
      categories: initialCategory ? [initialCategory] : [],
      brands: initialBrand ? [initialBrand] : [],
      inStockOnly: currentInStock,
    }),
    [initialSearchQuery, initialCategory, initialBrand, currentInStock]
  );

  const hasActiveFilters = useMemo(
    () =>
      filters.brands.length > 0 ||
      filters.categories.length > 0 ||
      filters.inStockOnly ||
      filters.searchQuery.trim().length > 0,
    [filters]
  );

  // Helper to update URL
  const updateUrl = useCallback(
    (newParams: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset page to 1 if not explicitly setting page
      if (!newParams.page && newParams.page !== null) {
        params.set("page", "1");
      }

      const queryString = params.toString();
      const url = queryString ? `?${queryString}` : window.location.pathname;

      startTransition(() => {
        router.push(url, { scroll: true });
      });
    },
    [router, searchParams]
  );

  // Pagination handlers
  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: true });
      });
    },
    [router, searchParams]
  );

  const goToFirstPage = useCallback(() => setPage(1), [setPage]);
  const goToLastPage = useCallback(
    () => setPage(totalPages),
    [setPage, totalPages]
  );
  const goToNextPage = useCallback(
    () => setPage(currentPage + 1),
    [setPage, currentPage]
  );
  const goToPreviousPage = useCallback(
    () => setPage(currentPage - 1),
    [setPage, currentPage]
  );

  // Filter handlers
  const setSearchQuery = useCallback(
    (query: string) => {
      updateUrl({ search: query || null });
    },
    [updateUrl]
  );

  const toggleBrand = useCallback(
    (brand: Brand) => {
      // Since we only support single selection in URL for simplicity in this refactor,
      // or we can support multiple if we want.
      // The previous implementation supported multiple in state, but URL usually implies single or comma-separated.
      // Let's stick to single selection for now to match the `page.tsx` implementation which expects `brand` string.
      // If the user wants to toggle off, we remove it.
      const currentBrand = searchParams.get("brand");
      if (currentBrand === brand) {
        updateUrl({ brand: null });
      } else {
        updateUrl({ brand: brand });
      }
    },
    [searchParams, updateUrl]
  );

  const toggleCategory = useCallback(
    (category: Category) => {
      const currentCategory = searchParams.get("category");
      if (currentCategory === category) {
        updateUrl({ category: null });
      } else {
        updateUrl({ category: category });
      }
    },
    [searchParams, updateUrl]
  );

  const setInStockOnly = useCallback(
    (inStockOnly: boolean) => {
      updateUrl({ inStock: inStockOnly ? "true" : null });
    },
    [updateUrl]
  );

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push(window.location.pathname, { scroll: true });
    });
  }, [router]);

  const setSortOption = useCallback(
    (option: SortOption) => {
      // Don't reset page when sorting
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", option);
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: true });
      });
    },
    [router, searchParams]
  );

  return {
    paginatedProducts: products, // Pass-through
    totalProducts,
    totalPages,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    setPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    filters,
    setSearchQuery,
    toggleBrand,
    toggleCategory,
    setInStockOnly,
    clearFilters,
    hasActiveFilters,
    sortOption: currentSort,
    setSortOption,
    isPending,
  };
}
