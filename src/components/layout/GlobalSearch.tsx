"use client";

import {
  type SearchResult,
  searchProducts,
} from "@/app/actions/search-products";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setQuery(search);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const products = await searchProducts(query);
        setResults(products);
        setIsOpen(true);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (query.trim()) {
      router.push(`/produtos?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/produtos");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const renderDropdownContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          Buscando...
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          Nenhum produto encontrado.
        </div>
      );
    }

    return (
      <ul>
        {results.map((product) => (
          <li
            key={product.id}
            className="border-b border-slate-100 dark:border-slate-700 last:border-0"
          >
            <Link
              href={`/produtos/${product.id}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="h-10 w-10 flex-shrink-0 relative bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-xs text-slate-400">
                    N/A
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{product.brand}</span>
                  <span>•</span>
                  <span className="font-medium text-brand-600 dark:text-brand-400">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
        <li className="p-2 bg-slate-50 dark:bg-slate-800/50 text-center">
          <button
            type="button"
            onClick={(e) => handleSearch(e)}
            className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
          >
            Ver todos os resultados
          </button>
        </li>
      </ul>
    );
  };

  return (
    <div className="w-full max-w-lg relative" ref={containerRef}>
      <form onSubmit={handleSearch} className="w-full">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-slate-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="search"
            className="block w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 dark:focus:border-brand-400 dark:focus:ring-brand-400 sm:text-sm"
            placeholder="Buscar produtos..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen && e.target.value.length >= 2) setIsOpen(true);
            }}
            onFocus={() => {
              if (query.length >= 2 && results.length > 0) setIsOpen(true);
            }}
          />
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
}

export function GlobalSearch() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-lg h-9 bg-slate-100 rounded-full animate-pulse" />
      }
    >
      <SearchInput />
    </Suspense>
  );
}
