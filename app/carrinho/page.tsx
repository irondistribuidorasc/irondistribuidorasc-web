import { CarrinhoCheckout } from "@/src/components/carrinho/CarrinhoCheckout";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/src/components/ui/LoadingSkeleton";

export const metadata: Metadata = {
  title: "Carrinho de Compras | IRON DISTRIBUIDORA SC",
  description:
    "Finalize seu pedido de peças para celular via WhatsApp. Revise os itens e complete os dados para envio.",
};

export default function CarrinhoPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8 space-y-2 text-center md:text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-600">
          Finalizar pedido
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
          Carrinho de Compras
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Revise os itens, complete seus dados e finalize o pedido via WhatsApp.
        </p>
      </div>
      <Suspense fallback={<LoadingSkeleton />}>
        <CarrinhoCheckout />
      </Suspense>
    </div>
  );
}

