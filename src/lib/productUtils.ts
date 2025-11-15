import type { Product, Brand, Category } from "@/src/data/products";

export type ProductFilters = {
  brands: Brand[];
  categories: Category[];
  inStockOnly: boolean;
  searchQuery: string;
};

/**
 * Calcula o score de relevância de um produto
 * Prioriza: inStock > popularity > nome alfabético
 */
export function getRelevanceScore(product: Product): number {
  let score = 0;

  // Produtos em estoque têm prioridade máxima (10000 pontos)
  if (product.inStock) {
    score += 10000;
  }

  // Popularidade contribui com até 100 pontos
  score += product.popularity ?? 50;

  return score;
}

/**
 * Ordena produtos por relevância (maior score primeiro)
 */
export function sortByRelevance(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const scoreA = getRelevanceScore(a);
    const scoreB = getRelevanceScore(b);

    // Se scores iguais, ordena alfabeticamente pelo nome
    if (scoreA === scoreB) {
      return a.name.localeCompare(b.name, "pt-BR");
    }

    return scoreB - scoreA;
  });
}

/**
 * Aplica filtros aos produtos
 */
export function filterProducts(
  products: Product[],
  filters: ProductFilters
): Product[] {
  return products.filter((product) => {
    // Filtro de marca
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false;
    }

    // Filtro de categoria
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(product.category)
    ) {
      return false;
    }

    // Filtro de disponibilidade
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }

    // Filtro de busca (nome, código, modelo)
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      const searchableText = `${product.name} ${product.code} ${product.model}`.toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Formata valor em reais (BRL)
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Formata data de reestoque
 * @throws Error se a data for inválida
 */
export function formatRestockDate(dateString: string): string {
  const date = new Date(dateString);
  
  // Valida se a data é válida
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Pagina um array de produtos
 */
export function paginateProducts(
  products: Product[],
  page: number,
  itemsPerPage: number
): Product[] {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return products.slice(startIndex, endIndex);
}

/**
 * Calcula o total de páginas
 */
export function getTotalPages(totalItems: number, itemsPerPage: number): number {
  return Math.ceil(totalItems / itemsPerPage);
}

/**
 * Gera range de números de página para exibição
 */
export function getPageRange(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

