"use client";

import type { Brand, Category, Product } from "@/src/data/products";
import {
  filterProducts,
  getTotalPages,
  paginateProducts,
  type ProductFilters,
  type SortOption,
  sortProducts,
} from "@/src/lib/productUtils";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseProductFiltersReturn = {
  // Produtos processados
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
};

const ITEMS_PER_PAGE = 60;

const initialFilters: ProductFilters = {
  brands: [],
  categories: [],
  inStockOnly: false,
  searchQuery: "",
};

export function useProductFilters(
  allProducts: Product[],
  initialSearchQuery: string = "",
  initialCategory?: Category,
  initialBrand?: Brand
): UseProductFiltersReturn {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [filters, setFilters] = useState<ProductFilters>({
    ...initialFilters,
    searchQuery: initialSearchQuery,
    categories: initialCategory ? [initialCategory] : [],
    brands: initialBrand ? [initialBrand] : [],
  });

  // Sync filters with props when URL params change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((prev) => ({
      ...prev,
      searchQuery: initialSearchQuery,
      categories: initialCategory ? [initialCategory] : [],
      brands: initialBrand ? [initialBrand] : [],
    }));
    setCurrentPage(1);
  }, [initialSearchQuery, initialCategory, initialBrand]);

  // Produtos filtrados e ordenados
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = filterProducts(allProducts, filters);
    return sortProducts(filtered, sortOption);
  }, [allProducts, filters, sortOption]);

  // Total de produtos após filtros
  const totalProducts = filteredAndSortedProducts.length;

  // Total de páginas
  const totalPages = useMemo(
    () => getTotalPages(totalProducts, ITEMS_PER_PAGE),
    [totalProducts]
  );

  // Produtos da página atual
  const paginatedProducts = useMemo(
    () =>
      paginateProducts(filteredAndSortedProducts, currentPage, ITEMS_PER_PAGE),
    [filteredAndSortedProducts, currentPage]
  );

  // Verifica se tem filtros ativos
  const hasActiveFilters = useMemo(
    () =>
      filters.brands.length > 0 ||
      filters.categories.length > 0 ||
      filters.inStockOnly ||
      filters.searchQuery.trim().length > 0,
    [filters]
  );

  // Navegação de páginas
  const setPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
      // Scroll para o topo ao mudar de página (apenas no client)
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages]
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

  // Atualização de filtros
  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
    setCurrentPage(1); // Reset para primeira página ao filtrar
  }, []);

  const toggleBrand = useCallback((brand: Brand) => {
    setFilters((prev) => {
      const brands = prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand];
      return { ...prev, brands };
    });
    setCurrentPage(1);
  }, []);

  const toggleCategory = useCallback((category: Category) => {
    setFilters((prev) => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
    setCurrentPage(1);
  }, []);

  const setInStockOnly = useCallback((inStockOnly: boolean) => {
    setFilters((prev) => ({ ...prev, inStockOnly }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setCurrentPage(1);
    setSortOption("relevance");
  }, []);

  return {
    paginatedProducts,
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
    sortOption,
    setSortOption,
  };
}
