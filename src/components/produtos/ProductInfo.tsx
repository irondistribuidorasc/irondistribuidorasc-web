"use client";

import { useCart } from "@/src/contexts/CartContext";
import type { Product } from "@/src/data/products";
import { formatPrice, formatRestockDate } from "@/src/lib/productUtils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ProductInfoProps = {
  product: Product;
};

const FEEDBACK_DURATION_MS = 600;

export function ProductInfo({ product }: ProductInfoProps) {
  const { addItem } = useCart();
  const { data: session } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAuthenticated = !!session?.user;
  const isApproved = session?.user?.approved === true;
  const canViewPrices = isAuthenticated && isApproved;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product);

    // Temporary visual feedback
    timeoutRef.current = setTimeout(() => {
      setIsAdding(false);
      timeoutRef.current = null;
    }, FEEDBACK_DURATION_MS);
  };

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Price Section */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Preço Unitário
        </p>
        {canViewPrices ? (
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-brand-600 dark:text-brand-400">
              {formatPrice(product.price)}
            </span>
            {product.inStock && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Em estoque
              </span>
            )}
          </div>
        ) : isAuthenticated && !isApproved ? (
          <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <p className="font-medium">Aguardando aprovação</p>
            <p className="mt-1 text-sm">
              Seu cadastro está em análise. Em breve você poderá ver os preços e
              fazer pedidos.
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
              Faça login para ver preços e comprar
            </p>
            <Link
              href="/login?callbackUrl=/produtos"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Entrar na minha conta
            </Link>
          </div>
        )}
      </div>

      {/* Stock Status & Actions */}
      {canViewPrices && (
        <div className="space-y-6 border-t border-slate-100 pt-6 dark:border-slate-700">
          {!product.inStock ? (
            <div className="space-y-3">
              <div className="flex items-center text-red-600 dark:text-red-400">
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="font-medium">Fora de estoque</span>
              </div>
              {product.restockDate && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Previsão de reposição:{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {formatRestockDate(product.restockDate)}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full rounded-xl bg-brand-600 px-6 py-4 text-center font-bold text-white shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isAdding ? "Adicionado ao Carrinho!" : "Adicionar ao Carrinho"}
            </button>
          )}

          {/* Additional Info / Benefits */}
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-brand-600 dark:text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Garantia de 1 ano
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-brand-600 dark:text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Envio Imediato
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
